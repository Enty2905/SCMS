package com.scms.repository;

import com.scms.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        ORDER BY e.name ASC
    """)
    List<Employee> findAllWithDetails();

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        WHERE NOT EXISTS (
            SELECT 1 FROM User u WHERE u.employee.employeeId = e.employeeId
        )
        ORDER BY e.name ASC
    """)
    List<Employee> findEmployeesWithoutAccount();
}
