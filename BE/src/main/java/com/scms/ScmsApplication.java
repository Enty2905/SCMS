package com.scms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.ZoneId;
import java.util.TimeZone;

/**
 * SCMS - Supply Chain Management System
 * Main Application Entry Point
 */
@SpringBootApplication
@EnableScheduling
public class ScmsApplication {

    public static void main(String[] args) {
        String configuredTimeZone = System.getenv().getOrDefault(
                "APP_TIME_ZONE",
                "Asia/Ho_Chi_Minh"
        );
        ZoneId applicationTimeZone = ZoneId.of(configuredTimeZone);
        TimeZone.setDefault(TimeZone.getTimeZone(applicationTimeZone));
        SpringApplication.run(ScmsApplication.class, args);
    }
}
