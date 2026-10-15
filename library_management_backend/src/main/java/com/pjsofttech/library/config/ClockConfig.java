// src/main/java/com/pjsofttech/library/config/ClockConfig.java
package com.pjsofttech.library.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;

@Configuration
public class ClockConfig {

    /**
     * Inject a Clock bean instead of calling LocalDate.now() directly.
     * This makes fine calculations unit-testable with a fixed clock.
     *
     * In tests: Clock.fixed(Instant.parse("2026-10-03T00:00:00Z"), ZoneId.of("Asia/Kolkata"))
     */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}