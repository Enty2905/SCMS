package com.scms.repository;

import com.scms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    // Fetch user kèm employee + employee_role + role để tránh N+1
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.employee e
        LEFT JOIN FETCH e.department
        LEFT JOIN FETCH e.position
        WHERE u.username = :username
    """)
    Optional<User> findByUsernameWithDetails(@Param("username") String username);
}
