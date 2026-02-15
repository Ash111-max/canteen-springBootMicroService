package com.example.menuservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    @Autowired
    private MenuRepository menuRepository;

    // 1. Get all items
    @GetMapping
    public List<MenuItem> getAllItems() {
        return menuRepository.findAll();
    }

    // 2. Add a new item
    @PostMapping
    public MenuItem addItem(@RequestBody MenuItem item) {
        if (item.getQuantity() <= 0) {
            item.setAvailable(false);
        } else {
            item.setAvailable(true);
        }
        return menuRepository.save(item);
    }

    // 3. Get specific item by ID
    @GetMapping("/{id}")
    public MenuItem getItemById(@PathVariable("id") Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }
    
    // 4. Update Stock Endpoint (FIXED)
    @PostMapping("/updateStock/{id}/{newQty}")
    public MenuItem updateStock(@PathVariable("id") Long id, @PathVariable("newQty") int newQty) {
        System.out.println("🔔 Request received to update Item ID: " + id + " to New Qty: " + newQty);
        
        MenuItem item = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        
        item.setQuantity(newQty);
        
        if (newQty <= 0) {
            item.setAvailable(false);
        } else {
            item.setAvailable(true);
        }
        
        MenuItem saved = menuRepository.save(item);
        System.out.println("✅ Database updated successfully!");
        return saved;
    }
}