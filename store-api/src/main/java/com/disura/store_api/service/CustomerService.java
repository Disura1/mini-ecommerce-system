package com.disura.store_api.service;

import com.disura.store_api.model.Customer;
import com.disura.store_api.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }

    public Customer getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found with email: " + email));
    }

    public Customer createCustomer(Customer customer) {
        // Hash password on direct creation too
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer updatedCustomer) {
        Customer customer = getCustomerById(id);
        customer.setFullName(updatedCustomer.getFullName());
        customer.setEmail(updatedCustomer.getEmail());

        // Hash the new password if provided
        if (updatedCustomer.getPassword() != null && !updatedCustomer.getPassword().isBlank()) {
            customer.setPassword(passwordEncoder.encode(updatedCustomer.getPassword()));
        }

        if (updatedCustomer.getRole() != null) {
            customer.setRole(updatedCustomer.getRole());
        }

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}