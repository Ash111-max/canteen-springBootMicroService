package com.example.orderservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Controller
public class WebController {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private OrderRepository orderRepository;
    
    // 1. ROOT URL -> Show Welcome Page
    @GetMapping("/") 
    public String showWelcomePage() {
        return "welcome";
    }

    // 2. HOME URL -> Show the Menu (Requires Login)
    @GetMapping("/home") 
    public String showHomePage(Model model) {
        String menuUrl = "http://localhost:8081/menu";
        try {
            DTOs.MenuItemDTO[] menuItems = restTemplate.getForObject(menuUrl, DTOs.MenuItemDTO[].class);
            model.addAttribute("menuItems", menuItems);
        } catch (Exception e) {
            model.addAttribute("error", "Menu Service is down!");
        }
        return "home";
    }

    // 3. Handle the Order from UI - FIXED VERSION
    @GetMapping("/order-ui/place")
    public String placeOrderUI(@RequestParam String rollNumber, 
                               @RequestParam Long itemId, 
                               Model model) {
        
        String resultMessage = "";
        String status = "success";

        try {
            // A. Check Menu & Get Item Details
            String menuUrl = "http://localhost:8081/menu/" + itemId;
            DTOs.MenuItemDTO item = restTemplate.getForObject(menuUrl, DTOs.MenuItemDTO.class);
            
            if (item == null) {
                throw new RuntimeException("Item not found!");
            }
            
            // B. Check Stock Availability
            if (item.quantity <= 0) {
                throw new RuntimeException("Item is SOLD OUT!");
            }
            
            // C. Deduct Wallet Balance
            String walletUrl = "http://localhost:8082/wallet/deduct?rollNumber=" + rollNumber + "&amount=" + item.price;
            restTemplate.postForObject(walletUrl, null, DTOs.WalletDTO.class);
            
            // D. ✅ UPDATE STOCK (This was missing!)
            int newQty = item.quantity - 1;
            String stockUrl = "http://localhost:8081/menu/updateStock/" + item.id + "/" + newQty;
            
            try {
                restTemplate.postForObject(stockUrl, null, DTOs.MenuItemDTO.class);
                System.out.println("✅ Stock updated: Item ID " + item.id + " -> New Qty: " + newQty);
            } catch (Exception e) {
                System.err.println("❌ FAILED TO UPDATE STOCK for Item ID: " + item.id);
                e.printStackTrace();
                // Continue anyway - order already placed
            }
            
            // E. Save Order
            FoodOrder order = new FoodOrder(rollNumber, itemId, item.price, "CONFIRMED");
            orderRepository.save(order);
            
            // F. Send Notification
            String notifyUrl = "http://localhost:8084/notify/send?rollNumber=" + rollNumber + "&message=Order Placed: " + item.name;
            try { 
                restTemplate.postForObject(notifyUrl, null, String.class); 
            } catch (Exception e) {
                System.out.println("Notification service unavailable");
            }

            resultMessage = "✅ Success! Ordered " + item.name + ". Order ID: " + order.getId();
            
        } catch (Exception e) {
            resultMessage = "❌ Order Failed: " + e.getMessage();
            status = "error";
        }

        // Reload the menu to show updated quantities
        String menuUrl = "http://localhost:8081/menu";
        DTOs.MenuItemDTO[] menuItems = restTemplate.getForObject(menuUrl, DTOs.MenuItemDTO[].class);
        model.addAttribute("menuItems", menuItems);
        
        model.addAttribute("message", resultMessage);
        model.addAttribute("status", status);
        
        return "home";
    }
    
    // 4. Show Order History Page
    @GetMapping("/history")
    public String showHistoryPage(@RequestParam(required = false) String rollNumber, Model model) {
        if (rollNumber != null && !rollNumber.isEmpty()) {
            List<FoodOrder> orders = orderRepository.findByRollNumber(rollNumber);
            model.addAttribute("orders", orders);
            model.addAttribute("rollNumber", rollNumber);
        }
        return "history";
    }
    
    // 5. Show Login Page
    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    // 6. Show Signup Page
    @GetMapping("/signup")
    public String showSignupPage() {
        return "signup";
    }
    
    // 7. Wallet page
    @GetMapping("/wallet")
    public String showWalletPage() {
        return "wallet";
    }
    
    // 8. Admin pages
    @GetMapping("/admin")
    public String showAdminPage() {
        return "admin";
    }
    
    @GetMapping("/admin-login")
    public String showAdminLoginPage() {
        return "admin-login";
    }
    
    // 9. ✅ NEW: Forgot Password Page
    @GetMapping("/forgot-password")
    public String showForgotPasswordPage() {
        return "forgot-password";
    }
    
    // 10. ✅ NEW: Reset Password Page
    @GetMapping("/reset-password")
    public String showResetPasswordPage() {
        return "reset-password";
    }
}
