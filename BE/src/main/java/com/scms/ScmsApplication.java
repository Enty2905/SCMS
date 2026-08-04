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

    private static final ZoneId APPLICATION_TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone(APPLICATION_TIME_ZONE));
        SpringApplication.run(ScmsApplication.class, args);
    }
}
