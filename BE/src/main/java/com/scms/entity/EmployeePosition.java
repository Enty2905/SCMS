package com.scms.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Entity
@Table(name = "employee_position")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeePosition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "position_id")
    UUID positionId;

    @Column(name = "position_name", length = 150, nullable = false)
    String positionName;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;
}

