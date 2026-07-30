package com.scms.department.repository;

import com.scms.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    @Query("""
        SELECT d, COUNT(e.employeeId)
        FROM Department d
        LEFT JOIN Employee e ON e.department.departmentId = d.departmentId
        GROUP BY d.departmentId, d.departmentName, d.departmentCode, d.description
        ORDER BY d.departmentName ASC
    """)
    List<Object[]> findDepartmentsWithEmployeeCount();

    /**
     * Danh sách phòng ban kèm sĩ số, lọc theo từ khóa tên/mã/mô tả.
     * Truyền chuỗi rỗng để lấy toàn bộ.
     */
    @Query("""
        SELECT d, COUNT(e.employeeId)
        FROM Department d
        LEFT JOIN Employee e ON e.department.departmentId = d.departmentId
        WHERE :search = ''
           OR LOWER(d.departmentName) LIKE CONCAT('%', :search, '%')
           OR LOWER(COALESCE(d.departmentCode, '')) LIKE CONCAT('%', :search, '%')
           OR LOWER(COALESCE(d.description, '')) LIKE CONCAT('%', :search, '%')
        GROUP BY d.departmentId, d.departmentName, d.departmentCode, d.description
        ORDER BY d.departmentName ASC
    """)
    List<Object[]> searchDepartmentsWithEmployeeCount(@Param("search") String search);

    Optional<Department> findByDepartmentCode(String departmentCode);

    List<Department> findAllByOrderByDepartmentNameAsc();
}
