package com.scms.repository;

import com.scms.entity.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeRoleRepository extends JpaRepository<EmployeeRole, UUID> {

    @Query("SELECT er FROM EmployeeRole er JOIN FETCH er.role WHERE er.employee.employeeId = :employeeId")
    List<EmployeeRole> findByEmployeeId(@Param("employeeId") UUID employeeId);
}
