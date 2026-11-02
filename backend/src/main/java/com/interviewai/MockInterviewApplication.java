package com.interviewai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MockInterviewApplication {

    public static void main(String[] args) {
        SpringApplication.run(MockInterviewApplication.class, args);
        System.out.println("\n==========================================");
        System.out.println("  Mock Interview Portal Backend Started");
        System.out.println("  Running on http://localhost:8080");
        System.out.println("==========================================\n");
    }
}
