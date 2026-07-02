package com.scms.employee.entity;

import com.scms.department.entity.Department;
import com.scms.user.entity.EmployeeRole;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "employee")
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

    @Column(name = "avatar_url", length = 500)
    String avatarUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    EmployeePosition position;

    // Vị trí/nơi làm việc: PXVH, PXSCC, kho vật tư...
    @Column(name = "work_location", length = 200)
    String workLocation;

    @OneToMany(mappedBy = "employee", fetch = FetchType.LAZY)
    @ToString.Exclude
    List<EmployeeRole> employeeRoles;
}
