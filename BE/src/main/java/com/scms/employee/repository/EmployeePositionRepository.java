package com.scms.employee.repository;

import com.scms.employee.entity.EmployeePosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmployeePositionRepository extends JpaRepository<EmployeePosition, UUID> {
}
