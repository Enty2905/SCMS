package com.scms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Swagger / OpenAPI 3 cho SCMS
 * Truy cập: http://localhost:{port}/scms/api/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${app.name}") String appName,
            @Value("${app.description}") String appDescription,
            @Value("${app.version}") String appVersion,
            @Value("${app.team-name}") String teamName,
            @Value("${app.contact-email}") String contactEmail
    ) {
        return new OpenAPI()
                // ── Thông tin chung của API ──────────────────────────
                .info(new Info()
                        .title(appName + " API")
                        .description(("""
                                ## %s (%s)
                                
                                ### Cách xác thực:
                                1. Gọi **POST /auth/login** để lấy `token`
                                2. Nhấn nút **Authorize 🔒** ở góc trên bên phải
                                3. Nhập `Bearer <token>` vào ô **Value** rồi bấm **Authorize**
                                4. Sau đó tất cả API cần xác thực đều hoạt động bình thường
                                
                                """).formatted(appDescription, appName))
                        .version(appVersion)
                        .contact(new Contact()
                                .name(teamName)
                                .email(contactEmail))
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
