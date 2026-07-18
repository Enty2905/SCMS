package com.scms.employee.entity;

import com.scms.department.entity.Department;
import com.scms.user.entity.EmployeeRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "employee")
@SQLDelete(sql = "UPDATE employee SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE employee_id = ?")
@SQLRestriction("is_deleted = false")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "employee_id")
    UUID employeeId;

    @Column(name = "name", length = 150, nullable = false)
    String name;

    @Column(name = "phone", length = 20)
    String phone;

    @Column(name = "email", length = 150)
    String email;

    @Column(name = "avatar_url", length = 500)
    String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    EmployeePosition position;

    // Vị trí/nơi làm việc: PXVH, PXSCC, kho vật tư...
    @Column(name = "work_location", length = 200)
    String workLocation;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    Boolean deleted = false;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    List<EmployeeRole> employeeRoles;
}
