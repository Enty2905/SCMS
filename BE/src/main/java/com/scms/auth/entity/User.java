package com.scms.auth.entity;

import com.scms.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    UUID userId;

    @Column(name = "username", length = 100, nullable = false, unique = true)
    String username;

    @Column(name = "password_hash", length = 255, nullable = false)
    String passwordHash;

    // Tài khoản được cấp cho một nhân viên (1-1)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Employee employee;

    @Column(name = "is_active", nullable = false)
    Boolean isActive;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (isActive == null) isActive = true;
        createdAt = LocalDateTime.now();
    }
}
