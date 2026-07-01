package com.scms.config;

import com.scms.employee.repository.EmployeeRepository;
import com.scms.user.repository.EmployeeRoleRepository;
import com.scms.user.repository.RoleRepository;
import com.scms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Khởi tạo ứng dụng.
 * Dữ liệu mặc định được seed qua SQL script, không cần tạo ở đây.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,
                                        RoleRepository roleRepository,
                                        EmployeeRepository employeeRepository,
                                        EmployeeRoleRepository employeeRoleRepository) {
        return args -> {
            log.info("Ứng dụng SCMS đã khởi động. Dữ liệu được seed qua SQL script.");
        };
    }
}
