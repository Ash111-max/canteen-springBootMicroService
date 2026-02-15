package com.example.orderservice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/place")
    public String placeOrder(@RequestParam String rollNumber, @RequestParam Long itemId) {

        // 1. Get Item Details from Menu Service
        String menuUrl = "http://localhost:8081/menu/" + itemId;
        DTOs.MenuItemDTO item = restTemplate.getForObject(menuUrl, DTOs.MenuItemDTO.class);

        if (item == null) return "Item not found!";

        // Check Stock Validation
        if (item.quantity <= 0) {
            return "Order Failed: Item is SOLD OUT!";
        }

        // 2. Deduct Balance from Wallet Service
        String walletUrl = "http://localhost:8082/wallet/deduct?rollNumber=" + rollNumber + "&amount=" + item.price;
        try {
            restTemplate.postForObject(walletUrl, null, DTOs.WalletDTO.class);
        } catch (Exception e) {
            return "Order Failed: Insufficient Funds!";
        }

        // 3. Deduct Stock
        int newQty = item.quantity - 1;
        String stockUrl = "http://localhost:8081/menu/updateStock/" + item.id + "/" + newQty;

        try {
            restTemplate.postForObject(stockUrl, null, DTOs.MenuItemDTO.class);
            System.out.println("✅ Stock update successful for Item ID: " + item.id);
        } catch (Exception e) {
            System.err.println("❌ FAILED TO UPDATE STOCK. URL: " + stockUrl);
            e.printStackTrace();
        }

        // 4. Save Order with Item Name (✅ ENHANCED)
        FoodOrder order = new FoodOrder(rollNumber, itemId, item.name, item.price, "CONFIRMED");
        orderRepository.save(order);

        // 5. Send Notification
        String notifyUrl = "http://localhost:8084/notify/send?rollNumber=" + rollNumber + "&message=Order Placed Successfully for " + item.name;
        try {
            restTemplate.postForObject(notifyUrl, null, String.class);
        } catch (Exception e) {
            System.out.println("Failed to send notification");
        }

        return "Order Placed Successfully! Order ID: " + order.getId();
    }
    
    // ✅ NEW: Get Order History for a Student
    @GetMapping("/history")
    public List<FoodOrder> getOrderHistory(@RequestParam String rollNumber) {
        return orderRepository.findByRollNumber(rollNumber);
    }
}
