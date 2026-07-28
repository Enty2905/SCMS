package com.scms.user.repository;

import com.scms.employee.entity.Employee;
import com.scms.user.entity.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeRoleRepository extends JpaRepository<EmployeeRole, UUID> {

    @Query("SELECT er FROM EmployeeRole er JOIN FETCH er.role WHERE er.employee.employeeId = :employeeId")
    List<EmployeeRole> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"role"})
    List<EmployeeRole> findByEmployee(Employee employee);

    @Query("""
        SELECT er FROM EmployeeRole er
        JOIN FETCH er.role
        JOIN FETCH er.employee
        WHERE er.employee.employeeId IN :employeeIds
    """)
    List<EmployeeRole> findByEmployeeIds(@Param("employeeIds") Collection<UUID> employeeIds);

    void deleteByEmployeeEmployeeId(UUID employeeId);

    @Modifying
    @Query("DELETE FROM EmployeeRole er WHERE er.employee = :employee")
    void deleteByEmployee(@Param("employee") Employee employee);
}
