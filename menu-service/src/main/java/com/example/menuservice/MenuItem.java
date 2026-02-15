package com.example.menuservice;

import jakarta.persistence.*;

@Entity
@Table(name = "menu_items") 
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category; // e.g., "Snacks", "Drinks"
    private double price;
    private boolean isAvailable;
    private String imageUrl;
    private String type; // "Veg" or "Non-Veg"
    private int quantity;

    // --- CONSTRUCTORS ---
    public MenuItem() { }

    public MenuItem(String name, String category, double price, boolean isAvailable, String imageUrl, String type, int quantity) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.isAvailable = isAvailable;
        this.imageUrl = imageUrl;
        this.type = type;
        this.quantity = quantity;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}