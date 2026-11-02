package com.interviewai.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:sa}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Ensure data directory exists for embedded H2
        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        // If no URL or pointing to localhost (which doesn't exist inside Render cloud container)
        if (configuredUrl == null || configuredUrl.isBlank() || configuredUrl.contains("localhost") || configuredUrl.contains("127.0.0.1") || configuredUrl.contains("h2:mem") || configuredUrl.contains("h2:file")) {
            log.info("Starting with embedded H2 database (fallback for instant cloud zero-config).");
            return createH2DataSource();
        }

        // Try connecting to external cloud database (MySQL)
        try {
            log.info("Connecting to external database: {}", configuredUrl);
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(configuredUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setConnectionTimeout(6000);
            config.setInitializationFailTimeout(6000);

            if (configuredUrl.startsWith("jdbc:mysql:")) {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            }

            HikariDataSource ds = new HikariDataSource(config);
            try (Connection conn = ds.getConnection()) {
                log.info("Successfully connected to external database!");
                return ds;
            }
        } catch (Exception e) {
            log.warn("External database unreachable: {}. Falling back to embedded H2 database to ensure server stays LIVE.", e.getMessage());
            return createH2DataSource();
        }
    }

    private DataSource createH2DataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:h2:file:./data/mock_interview_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
        config.setDriverClassName("org.h2.Driver");
        config.setUsername("sa");
        config.setPassword("");
        return new HikariDataSource(config);
    }
}
