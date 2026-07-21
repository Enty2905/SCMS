package com.scms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SCMS - Supply Chain Management System
 * Main Application Entry Point
 */
@SpringBootApplication
@EnableScheduling
public class ScmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScmsApplication.class, args);
    }
}
