package com.example.walletservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/wallet")
@CrossOrigin(origins = "*")
public class WalletController {
    
    @Autowired
    private WalletRepository repository;
    
    // 1. Get all wallets (For debugging)
    @GetMapping
    public List<StudentWallet> getAllWallets() {
        return repository.findAll();
    }
    
    // 2. Get Balance by Roll Number
    @GetMapping("/{rollNumber}")
    public StudentWallet getWallet(@PathVariable String rollNumber) {
        return repository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }
    
    // 3. Deduct Money
    @PostMapping("/deduct")
    public StudentWallet deductBalance(@RequestParam String rollNumber, @RequestParam double amount) {
        StudentWallet student = repository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (student.getBalance() < amount) {
            throw new RuntimeException("Insufficient Funds!");
        }
        
        student.setBalance(student.getBalance() - amount);
        return repository.save(student);
    }
    
    // 4. Register
    @PostMapping("/register")
    public StudentWallet register(@RequestBody Map<String, String> payload) {
        String name = payload.get("studentName");
        String roll = payload.get("rollNumber");
        String pass = payload.get("password");
        
        if (repository.findByRollNumber(roll).isPresent()) {
            throw new RuntimeException("Student already registered!");
        }
        
        StudentWallet newStudent = new StudentWallet(name, roll, 500.00, pass);
        return repository.save(newStudent);
    }
    
    // 5. Login
    @PostMapping("/login")
    public StudentWallet login(@RequestBody Map<String, String> payload) {
        String roll = payload.get("rollNumber");
        String pass = payload.get("password");
        
        StudentWallet student = repository.findByRollNumber(roll)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (student.getPassword() == null || !student.getPassword().equals(pass)) {
            throw new RuntimeException("Wrong Password");
        }
        
        return student;
    }
    
    // 6. Add Money (Top-up)
    @PostMapping("/add")
    public StudentWallet addMoney(@RequestBody Map<String, Object> payload) {
        String rollNumber = (String) payload.get("rollNumber");
        Double amount = Double.valueOf(payload.get("amount").toString());
        
        StudentWallet student = repository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        student.setBalance(student.getBalance() + amount);
        return repository.save(student);
    }
    
    // ✅ 7. NEW: Verify Student Exists (For Password Reset)
    @PostMapping("/verify")
    public Map<String, Object> verifyStudent(@RequestBody Map<String, String> payload) {
        String rollNumber = payload.get("rollNumber");
        String studentName = payload.get("studentName");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            StudentWallet student = repository.findByRollNumber(rollNumber)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            // Verify name matches (case-insensitive)
            if (student.getStudentName().trim().equalsIgnoreCase(studentName.trim())) {
                response.put("verified", true);
                response.put("message", "Student verified successfully");
            } else {
                response.put("verified", false);
                response.put("message", "Name does not match our records");
            }
        } catch (Exception e) {
            response.put("verified", false);
            response.put("message", "Roll number not found");
        }
        
        return response;
    }
    
    // ✅ 8. NEW: Reset Password
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> payload) {
        String rollNumber = payload.get("rollNumber");
        String newPassword = payload.get("newPassword");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            StudentWallet student = repository.findByRollNumber(rollNumber)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            student.setPassword(newPassword);
            repository.save(student);
            
            response.put("success", true);
            response.put("message", "Password reset successful");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reset password");
        }
        
        return response;
    }
}
