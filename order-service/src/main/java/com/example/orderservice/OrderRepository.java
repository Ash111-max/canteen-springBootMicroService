package com.example.orderservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<FoodOrder, Long> {
	// Tells JPQ to write the SQL: "Select * from food_orders where roll_no = ?"
	List<FoodOrder> findByRollNumber(String rollNumber);
}
