package com.scms.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.scms.dto.request.*;
import com.scms.dto.response.AuthenticationResponse;
import com.scms.dto.response.IntrospectResponse;
import com.scms.entity.EmployeeRole;
import com.scms.entity.InvalidatedToken;
import com.scms.entity.User;
import com.scms.exception.AppException;
import com.scms.exception.ErrorCode;
import com.scms.repository.EmployeeRoleRepository;
import com.scms.repository.InvalidatedTokenRepository;
import com.scms.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    EmployeeRoleRepository employeeRoleRepository;
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${jwt.signerKey}")
    String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    long REFRESHABLE_DURATION;

    // ==========================================
    // LOGIN
    // ==========================================
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findByUsernameWithDetails(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        boolean matched = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if (!matched) throw new AppException(ErrorCode.UNAUTHENTICATED);

        var token = generateToken(user);
        var refreshToken = generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    // ==========================================
    // INTROSPECT (kiểm tra token còn hợp lệ không)
    // ==========================================
    public IntrospectResponse introspect(IntrospectRequest request) {
        try {
            verifyToken(request.getToken(), false);
            return IntrospectResponse.builder().valid(true).build();
        } catch (AppException | ParseException | JOSEException e) {
            return IntrospectResponse.builder().valid(false).build();
        }
    }

    // ==========================================
    // REFRESH TOKEN
    // ==========================================
    public AuthenticationResponse refreshToken(RefreshRequest request)
            throws ParseException, JOSEException {

        var signedJWT = verifyToken(request.getToken(), true);
        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        // Blacklist token cũ
        invalidatedTokenRepository.save(
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build()
        );

        var username = signedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        return AuthenticationResponse.builder()
                .token(generateToken(user))
                .refreshToken(generateRefreshToken(user))
                .authenticated(true)
                .build();
    }

    // ==========================================
    // LOGOUT
    // ==========================================
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        // Blacklist access token
        try {
            var accessJwt = verifyToken(request.getToken(), false);
            invalidatedTokenRepository.save(InvalidatedToken.builder()
                    .id(accessJwt.getJWTClaimsSet().getJWTID())
                    .expiryTime(accessJwt.getJWTClaimsSet().getExpirationTime())
                    .build());
        } catch (AppException e) {
            log.info("Access token already invalid, skipping blacklist");
        }

        // Blacklist refresh token nếu có
        if (request.getRefreshToken() != null) {
            try {
                var refreshJwt = verifyToken(request.getRefreshToken(), true);
                invalidatedTokenRepository.save(InvalidatedToken.builder()
                        .id(refreshJwt.getJWTClaimsSet().getJWTID())
                        .expiryTime(refreshJwt.getJWTClaimsSet().getExpirationTime())
                        .build());
            } catch (AppException e) {
                log.info("Refresh token already invalid, skipping blacklist");
            }
        }
    }

    // ==========================================
    // VERIFY TOKEN (dùng nội bộ)
    // ==========================================
    public SignedJWT verifyToken(String token, boolean isRefresh)
            throws ParseException, JOSEException {

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = isRefresh
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                        .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean verified = signedJWT.verify(verifier);
        if (!verified || !expiryTime.after(new Date())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        return signedJWT;
    }

    // ==========================================
    // GENERATE ACCESS TOKEN
    // ==========================================
    public String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("scms.vn")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("type", "access")
                .claim("userId", user.getUserId().toString())
                .claim("scope", buildScope(user))
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create access token", e);
            throw new RuntimeException(e);
        }
    }

    // ==========================================
    // GENERATE REFRESH TOKEN
    // ==========================================
    public String generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("scms.vn")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("type", "refresh")
                .claim("userId", user.getUserId().toString())
                .build();

        JWSObject jwsObject = new JWSObject(header, new Payload(claimsSet.toJSONObject()));
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create refresh token", e);
            throw new RuntimeException(e);
        }
    }

    // ==========================================
    // BUILD SCOPE (danh sách roles từ employee_role)
    // ==========================================
    private String buildScope(User user) {
        List<EmployeeRole> employeeRoles = employeeRoleRepository
                .findByEmployeeId(user.getEmployee().getEmployeeId());

        StringJoiner joiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(employeeRoles)) {
            employeeRoles.forEach(er -> joiner.add("ROLE_" + er.getRole().getRoleCode()));
        }
        return joiner.toString();
    }
}
