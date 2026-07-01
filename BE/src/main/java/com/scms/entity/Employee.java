package com.scms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
}
