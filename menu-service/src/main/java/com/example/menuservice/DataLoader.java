package com.example.menuservice;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class DataLoader {

    @Bean
    CommandLineRunner loadData(MenuRepository repository) {
        return args -> {
            // 1. UNCOMMENT THIS LINE FOR ONE RUN (To wipe old broken data)
//            repository.deleteAll(); 

            // 2. CHECK: Only load if empty (After delete, it will be empty)
            if (repository.count() == 0) {
                
            	repository.save(new MenuItem("Veg Burger", "Snacks", 50.00, true, "https://placehold.co/600x400/orange/white?text=Veg+Burger", "Veg", 50));
                repository.save(new MenuItem("Chicken Roll", "Snacks", 80.00, true, "https://placehold.co/600x400/red/white?text=Chicken+Roll", "Non-Veg", 50));
                repository.save(new MenuItem("Masala Chai", "Drinks", 15.00, true, "https://placehold.co/600x400/brown/white?text=Masala+Chai", "Veg", 100));
                repository.save(new MenuItem("Cold Coffee", "Drinks", 60.00, true, "https://placehold.co/600x400/black/white?text=Cold+Coffee", "Veg", 100));
                
                // This one has 0 Quantity -> Sold Out
                repository.save(new MenuItem("Chicken Momos", "Snacks", 100.00, false, "https://placehold.co/600x400/grey/white?text=Momos", "Non-Veg", 0));
                
                System.out.println("--- MENU DB RESET: Data Loaded Successfully ---");
            }
            else {
            	System.out.println("--- MENU DB: Data Loaded Successfully ---");
            }
        };
    }
}