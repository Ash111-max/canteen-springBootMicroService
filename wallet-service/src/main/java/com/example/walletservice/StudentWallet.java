package com.example.walletservice;

import jakarta.persistence.*;

@Entity
@Table(name = "student_wallets")
public class StudentWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;
    private String rollNumber; // Unique ID like "101"
    private double balance;
    
    private String password;

    // --- CONSTRUCTORS ---
    public StudentWallet() { }

    public StudentWallet(String studentName, String rollNumber, double balance, String password) {
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.balance = balance;
        this.password = password;
    }

    // --- GETTERS & SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}