package com.scms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Cấu hình Swagger / OpenAPI 3 cho SCMS
 * Truy cập: http://localhost:{port}/scms/api/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI(@Value("${server.port:8080}") String port,
                                 @Value("${server.servlet.context-path:/}") String contextPath) {
        return new OpenAPI()
                // ── Thông tin chung của API ──────────────────────────
                .info(new Info()
                        .title("SCMS – Supply Chain & Maintenance System API")
                        .description("""
                                ## Hệ thống Quản lý Vận hành & Bảo trì (SCMS)
                                
                                ### Cách xác thực:
                                1. Gọi **POST /auth/login** để lấy `token`
                                2. Nhấn nút **Authorize 🔒** ở góc trên bên phải
                                3. Nhập `Bearer <token>` vào ô **Value** rồi bấm **Authorize**
                                4. Sau đó tất cả API cần xác thực đều hoạt động bình thường
                                
                                ### Tài khoản test:
                                | Username | Password | Role |
                                |---|---|---|
                                | admin | password | ADMIN |
                                | hr | password | HR |
                                | warehouse_mat | password | WAREHOUSE_MAT |
                                | shift_leader | password | SHIFT_LEADER |
                                | repair_manager | password | REPAIR_MANAGER |
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SCMS Team")
                                .email("scms-team@example.com"))
                )

                // ── Cấu hình Bearer Token ────────────────────────────
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Nhập Access Token ở đây (không cần gõ 'Bearer ')")
                        )
                );
    }
}
