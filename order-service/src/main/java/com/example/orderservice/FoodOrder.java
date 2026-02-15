package com.example.orderservice;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_orders")
public class FoodOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String rollNumber;
    private Long itemId;
    
    // ✅ NEW: Store item name for better transaction history
    private String itemName;
    
    private double amount;
    private LocalDateTime orderTime;
    private String status; // "CONFIRMED" or "FAILED"
    
    // --- CONSTRUCTORS ---
    public FoodOrder() {}
    
    // Old constructor (for backward compatibility)
    public FoodOrder(String rollNumber, Long itemId, double amount, String status) {
        this.rollNumber = rollNumber;
        this.itemId = itemId;
        this.amount = amount;
        this.status = status;
        this.orderTime = LocalDateTime.now();
    }
    
    // ✅ NEW: Enhanced constructor with item name
    public FoodOrder(String rollNumber, Long itemId, String itemName, double amount, String status) {
        this.rollNumber = rollNumber;
        this.itemId = itemId;
        this.itemName = itemName;
        this.amount = amount;
        this.status = status;
        this.orderTime = LocalDateTime.now();
    }
    
    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    
    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
