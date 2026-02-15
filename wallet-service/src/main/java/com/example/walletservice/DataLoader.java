package com.example.walletservice;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class DataLoader {

    @Bean
    CommandLineRunner loadData(WalletRepository repository) {
        return args -> {
        	// ONLY load if empty
            if (repository.count() == 0) {
                repository.save(new StudentWallet("Rahul Sharma", "101", 1000.00, "1234"));
                repository.save(new StudentWallet("Priya Singh", "102", 10.00, "1234")); 
            }
        };
    }
}