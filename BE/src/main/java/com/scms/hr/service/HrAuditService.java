package com.scms.hr.service;

import com.scms.auth.repository.UserRepository;
import com.scms.common.exception.BadRequestException;
import com.scms.common.response.PagedResponse;
import com.scms.employee.entity.Employee;
import com.scms.hr.dto.response.HrAuditActionResponse;
import com.scms.hr.dto.response.HrAuditLogResponse;
import com.scms.hr.entity.HrAuditAction;
import com.scms.hr.entity.HrAuditLog;
import com.scms.hr.repository.HrAuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Ghi và tra cứu nhật ký thao tác nhân sự.
 *
 * <p>Việc ghi diễn ra trong cùng giao dịch với nghiệp vụ gọi nó, nên nghiệp vụ thất bại thì
 * nhật ký cũng không để lại dòng rác.
 *
 * <p>Không bao giờ truyền mật khẩu hay dữ liệu nhạy cảm vào tham số {@code detail}.
 */
@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HrAuditService {

    static int MAX_PAGE_SIZE = 200;
    static String SYSTEM_ACTOR = "system";

    HrAuditLogRepository hrAuditLogRepository;
    UserRepository userRepository;

    public void record(HrAuditAction action, UUID targetId, String targetName, String detail) {
        String username = currentUsername();

        hrAuditLogRepository.save(HrAuditLog.builder()
                .action(action)
                .targetType(action.getTarget())
                .targetId(targetId)
                .targetName(targetName)
                .performedBy(username)
                .performedByName(resolveActorName(username))
                .detail(detail)
                .build());
    }

    @Transactional(readOnly = true)
    public List<HrAuditActionResponse> getActions() {
        return HrAuditAction.all().stream()
                .map(action -> HrAuditActionResponse.builder()
                        .action(action.name())
                        .label(action.getLabel())
                        .targetType(action.getTarget().name())
                        .targetTypeLabel(action.getTarget().getLabel())
                        .build())
                .toList();
    }

    /**
     * Nhật ký có phân trang, mới nhất trước.
     *
     * @param from ngày bắt đầu (tính từ 00:00), để trống nếu không giới hạn
     * @param to   ngày kết thúc (tính hết ngày), để trống nếu không giới hạn
     */
    @Transactional(readOnly = true)
    public PagedResponse<HrAuditLogResponse> getLogs(
            String search,
            String action,
            LocalDate from,
            LocalDate to,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                normalizePageSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<HrAuditLog> result = hrAuditLogRepository.findAll(
                logSpecification(search, action, from, to),
                pageable
        );

        return PagedResponse.<HrAuditLogResponse>builder()
                .content(result.getContent().stream().map(this::toResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    private Specification<HrAuditLog> logSpecification(
            String search,
            String action,
            LocalDate from,
            LocalDate to
    ) {
        String keyword = StringUtils.hasText(search) ? search.trim().toLowerCase() : null;
        HrAuditAction auditAction = parseAction(action);

        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null) {
                String pattern = "%" + keyword + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(builder.coalesce(root.get("targetName"), "")), pattern),
                        builder.like(builder.lower(root.get("performedBy")), pattern),
                        builder.like(builder.lower(builder.coalesce(root.get("performedByName"), "")), pattern),
                        builder.like(builder.lower(builder.coalesce(root.get("detail"), "")), pattern)
                ));
            }

            if (auditAction != null) {
                predicates.add(builder.equal(root.get("action"), auditAction));
            }

            if (from != null) {
                predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay()));
            }

            if (to != null) {
                // Lấy hết ngày kết thúc, không cắt lúc 00:00.
                predicates.add(builder.lessThan(root.get("createdAt"), to.plusDays(1).atStartOfDay()));
            }

            return predicates.isEmpty() ? null : builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private HrAuditAction parseAction(String action) {
        if (!StringUtils.hasText(action) || "all".equalsIgnoreCase(action)) {
            return null;
        }

        try {
            return HrAuditAction.valueOf(action.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Thao tác không hợp lệ: " + action);
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        return authentication != null && StringUtils.hasText(authentication.getName())
                ? authentication.getName()
                : SYSTEM_ACTOR;
    }

    private String resolveActorName(String username) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    Employee employee = user.getEmployee();
                    return employee != null ? employee.getName() : null;
                })
                .orElse(null);
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }

        return Math.min(size, MAX_PAGE_SIZE);
    }

    private HrAuditLogResponse toResponse(HrAuditLog log) {
        LocalDateTime createdAt = log.getCreatedAt();

        return HrAuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction().name())
                .actionLabel(log.getAction().getLabel())
                .targetType(log.getTargetType().name())
                .targetTypeLabel(log.getTargetType().getLabel())
                .targetId(log.getTargetId())
                .targetName(log.getTargetName())
                .performedBy(log.getPerformedBy())
                .performedByName(log.getPerformedByName())
                .detail(log.getDetail())
                .createdAt(createdAt)
                .build();
    }
}
