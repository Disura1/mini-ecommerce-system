package com.disura.store_api.controller;

import com.disura.store_api.config.JwtService;
import com.disura.store_api.model.Customer;
import com.disura.store_api.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Customer customer) {
        // Hash the password before saving
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        customer.setRole(Customer.Role.CUSTOMER);
        customerRepository.save(customer);

        UserDetails userDetails = userDetailsService.loadUserByUsername(customer.getEmail());
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        body.get("email"),
                        body.get("password")
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(body.get("email"));
        String token = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(Map.of("token", token));
    }
}