package com.example.orderservice;

import com.fasterxml.jackson.annotation.JsonProperty; 

public class DTOs {
    
    // Holds data coming from Menu Service
    public static class MenuItemDTO {
        public Long id;
        public String name;
        public double price;
        public String category; 
        public String imageUrl;
        
       
        // This maps the JSON key "available" to this variable
        @JsonProperty("available") 
        public boolean isAvailable; 
        
        public String type;
        public int quantity;
    }

    // Holds data coming from Wallet Service
    public static class WalletDTO {
        public String rollNumber;
        public double balance;
    }
}