package com.scms.hr.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Một dòng nhật ký thao tác nhân sự: ai làm gì, với đối tượng nào, vào lúc nào.
 *
 * <p>Tên đối tượng được sao chép vào {@code targetName} tại thời điểm ghi, nên nhật ký vẫn đọc
 * được sau khi hồ sơ hoặc phòng ban bị xóa. Bảng này chỉ ghi thêm, không bao giờ sửa hay xóa.
 */
@Entity
@Table(
        name = "hr_audit_log",
        indexes = {
                @Index(name = "idx_hr_audit_created_at", columnList = "created_at"),
                @Index(name = "idx_hr_audit_action", columnList = "action")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HrAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", length = 50, nullable = false)
    HrAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", length = 30, nullable = false)
    HrAuditTarget targetType;

    @Column(name = "target_id")
    UUID targetId;

    @Column(name = "target_name", length = 200)
    String targetName;

    // Tên đăng nhập của người thực hiện.
    @Column(name = "performed_by", length = 100, nullable = false)
    String performedBy;

    // Họ tên nhân viên tương ứng, để nhật ký đọc được mà không phải tra thêm.
    @Column(name = "performed_by_name", length = 150)
    String performedByName;

    @Column(name = "detail", length = 500)
    String detail;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
