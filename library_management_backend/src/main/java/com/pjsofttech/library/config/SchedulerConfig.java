package com.pjsofttech.library.config;

import com.pjsofttech.library.service.LoanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class SchedulerConfig {

    private final LoanService loanService;

    /**
     * Every day at midnight: mark all past-due active loans as OVERDUE.
     * cron = "second minute hour day month weekday"
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void markOverdueLoans() {
        log.info("Scheduler: running overdue loan check...");
        loanService.markOverdueLoans();
    }
}