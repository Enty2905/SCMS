package com.scms.employee.repository;

import com.scms.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID>, JpaSpecificationExecutor<Employee> {

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        ORDER BY e.employeeCode ASC, e.name ASC
    """)
    List<Employee> findAllWithDetails();

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        WHERE NOT EXISTS (
            SELECT 1 FROM User u
            WHERE u.employee.employeeId = e.employeeId
              AND u.deleted = false
        )
        ORDER BY e.name ASC
    """)
    List<Employee> findEmployeesWithoutAccount();

    boolean existsByDepartmentDepartmentId(UUID departmentId);

    long countByDepartmentDepartmentId(UUID departmentId);

    /**
     * Số thứ tự lớn nhất đang dùng trong mã nhân viên (NV001 -> 1, NV012 -> 12).
     * Dùng native query để tính cả hồ sơ đã xóa mềm, tránh cấp lại mã đã dùng.
     */
    @Query(
            value = """
                SELECT COALESCE(MAX(CAST(SUBSTRING(employee_code, 3) AS UNSIGNED)), 0)
                FROM employee
                WHERE employee_code REGEXP '^NV[0-9]+$'
            """,
            nativeQuery = true
    )
    int findMaxEmployeeCodeSequence();

    @Query("""
        SELECT e FROM Employee e
        WHERE e.employeeCode IS NULL OR e.employeeCode = ''
        ORDER BY e.name ASC
    """)
    List<Employee> findWithoutEmployeeCode();

    @Query("""
        SELECT e FROM Employee e
        WHERE e.status IS NULL OR e.status = ''
    """)
    List<Employee> findWithoutStatus();

    /**
     * Hồ sơ đang giữ số điện thoại này, kể cả hồ sơ đã xóa mềm.
     * Bắt buộc dùng native query: {@code @SQLRestriction} khiến truy vấn JPA không thấy hồ sơ đã xóa,
     * trong khi ràng buộc UNIQUE của cơ sở dữ liệu vẫn tính chúng.
     *
     * @return các cặp (employee_code, is_deleted)
     */
    @Query(
            value = "SELECT employee_code, is_deleted FROM employee WHERE phone = :phone",
            nativeQuery = true
    )
    List<Object[]> findByPhoneIncludingDeleted(@Param("phone") String phone);

    /** Xem {@link #findByPhoneIncludingDeleted}. */
    @Query(
            value = "SELECT employee_code, is_deleted FROM employee WHERE email = :email",
            nativeQuery = true
    )
    List<Object[]> findByEmailIncludingDeleted(@Param("email") String email);
}
