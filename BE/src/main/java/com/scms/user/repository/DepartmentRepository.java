package com.scms.user.repository;

import com.scms.employee.entity.Department;
import com.scms.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    @Query("""
        SELECT d, COUNT(e.employeeId)
        FROM Department d
        LEFT JOIN Employee e ON e.department.departmentId = d.departmentId
        GROUP BY d.departmentId, d.departmentName, d.description
        ORDER BY d.departmentName ASC
    """)
    List<Object[]> findDepartmentsWithEmployeeCount();
}
