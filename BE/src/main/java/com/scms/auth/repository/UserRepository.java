package com.scms.auth.repository;

import com.scms.employee.entity.Employee;
import com.scms.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    /**
     * Nạp kèm nhân viên, phòng ban và chức vụ để màn hình danh sách tài khoản
     * không phải truy vấn thêm cho từng dòng.
     */
    @Override
    @EntityGraph(attributePaths = {"employee", "employee.department", "employee.position"})
    Page<User> findAll(Specification<User> specification, Pageable pageable);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmployeeEmployeeId(UUID employeeId);

    Optional<User> findByEmployeeEmployeeId(UUID employeeId);

    Optional<User> findByEmployee(Employee employee);

    Page<User> findByIsActive(Boolean isActive, Pageable pageable);

    // Tìm kiếm user theo username hoặc tên nhân viên
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.employee e
        WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
           OR e.phone LIKE CONCAT('%', :search, '%')
    """)
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    // Fetch user kèm employee + department + position để tránh N+1
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        WHERE u.username = :username
    """)
    Optional<User> findByUsernameWithDetails(@Param("username") String username);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        WHERE u.deleted = false
        ORDER BY u.createdAt DESC
    """)
    List<User> findAllWithEmployeeDetails();

    /**
     * Cặp (employeeId, isActive) của mọi tài khoản còn hiệu lực.
     * Dùng để dựng danh sách nhân viên mà không phải truy vấn từng người.
     */
    @Query("SELECT u.employee.employeeId, u.isActive FROM User u WHERE u.deleted = false")
    List<Object[]> findAccountStatusByEmployee();

    @EntityGraph(attributePaths = {"employee", "employee.department", "employee.position"})
    @Query("""
        SELECT u
        FROM User u
        JOIN u.employee employee
        WHERE u.deleted = false
          AND u.isActive = true
          AND (
              :search = ''
              OR LOWER(u.username) LIKE CONCAT('%', :search, '%')
              OR LOWER(employee.name) LIKE CONCAT('%', :search, '%')
          )
        ORDER BY employee.name ASC
    """)
    List<User> findActiveChatUsers(
            @Param("search") String search,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"employee", "employee.department", "employee.position"})
    @Query("""
        SELECT u
        FROM User u
        JOIN u.employee
        WHERE u.deleted = false
          AND u.isActive = true
          AND u.userId IN :userIds
    """)
    List<User> findAllActiveChatUsersByIds(@Param("userIds") List<UUID> userIds);
}
