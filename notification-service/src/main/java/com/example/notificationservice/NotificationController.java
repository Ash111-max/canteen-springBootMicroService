package com.example.notificationservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notify")
public class NotificationController {

    @Autowired
    private NotificationRepository repository;

    @PostMapping("/send")
    public String sendNotification(@RequestParam String rollNumber, @RequestParam String message) {
        // 1. Simulate sending email (Print to console)
        System.out.println("-------------------------------------------------");
        System.out.println("📧 SENDING EMAIL TO STUDENT: " + rollNumber);
        System.out.println("📝 MESSAGE: " + message);
        System.out.println("-------------------------------------------------");

        // 2. Save log to database
        NotificationLog log = new NotificationLog(rollNumber, message);
        repository.save(log);

        return "Notification Sent!";
    }
}