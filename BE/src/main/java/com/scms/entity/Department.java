package com.scms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "department")
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
}

