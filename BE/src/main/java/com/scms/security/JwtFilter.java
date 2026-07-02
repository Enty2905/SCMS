package com.scms.security;

import com.scms.auth.entity.User;
import com.scms.auth.repository.UserRepository;
import com.scms.auth.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        // Bulletproof: Nếu user lỡ gõ dư chữ "Bearer " trong Swagger UI dẫn đến "Bearer Bearer eyJ..."
        if (token.toLowerCase().startsWith("bearer ")) {
            token = token.substring(7).trim();
        }
        // Xóa dấu ngoặc kép nếu user lỡ copy thừa
        token = token.replace("\"", "");

        try {
            SignedJWT signedJWT = authenticationService.verifyToken(token, false);

            // Chỉ chấp nhận access token
            String tokenType = signedJWT.getJWTClaimsSet().getStringClaim("type");
            if (!"access".equals(tokenType)) {
                filterChain.doFilter(request, response);
                return;
            }

            String username = signedJWT.getJWTClaimsSet().getSubject();
            String scope = signedJWT.getJWTClaimsSet().getStringClaim("scope");

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                userRepository.findByUsername(username).ifPresentOrElse(user -> {
                    var authorities = AuthorityUtils.commaSeparatedStringToAuthorityList(
                            scope != null ? scope.replace(" ", ",") : "");
                    var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    logger.info("Authenticated user: " + username);
                }, () -> logger.warn("User not found in DB: " + username));
            }

        } catch (Exception e) {
            logger.warn("Invalid JWT token: " + e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
