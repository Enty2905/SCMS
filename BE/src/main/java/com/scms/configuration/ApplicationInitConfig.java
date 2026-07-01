package com.scms.configuration;

import com.scms.entity.Employee;
import com.scms.entity.EmployeeRole;
import com.scms.entity.Role;
import com.scms.entity.User;
import com.scms.repository.EmployeeRepository;
import com.scms.repository.EmployeeRoleRepository;
import com.scms.repository.RoleRepository;
import com.scms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Khởi tạo dữ liệu ban đầu khi ứng dụng start:
 * - Tạo các Role mặc định
 * - Tạo tài khoản admin mặc định nếu chưa có
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {

    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,
                                        RoleRepository roleRepository,
                                        EmployeeRepository employeeRepository,
                                        EmployeeRoleRepository employeeRoleRepository) {
        return args -> {
            log.info("Bỏ qua khởi tạo dữ liệu tự động, sử dụng seed data từ SQL.");
        };
    }

    private Role createRoleIfNotExists(RoleRepository roleRepository, String code, String name) {
        return roleRepository.findByRoleCode(code).orElseGet(() -> {
            Role role = roleRepository.save(Role.builder()
                    .roleCode(code)
                    .roleName(name)
                    .description(name)
                    .build());
            log.info("Created default role: {}", code);
            return role;
        });
    }
}
