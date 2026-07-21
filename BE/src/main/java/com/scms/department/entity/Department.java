package com.scms.department.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "department")
@SQLDelete(sql = "UPDATE department SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE department_id = ?")
@SQLRestriction("is_deleted = false")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "department_id")
    UUID departmentId;

    @Column(name = "department_name", length = 150, nullable = false)
    String departmentName;

    @Column(name = "department_code", length = 50, unique = true)
    String departmentCode;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean deleted = false;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;
}
