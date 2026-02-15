package com.example.walletservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<StudentWallet, Long> {
    // Custom query method: Spring automatically figures out the SQL for this!
    Optional<StudentWallet> findByRollNumber(String rollNumber);
}