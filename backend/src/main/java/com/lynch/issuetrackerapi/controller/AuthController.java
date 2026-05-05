package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.dto.LoginRequest;
import com.lynch.issuetrackerapi.dto.RegisterRequest;
import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.RepoRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RepoRepository repoRepository;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, RepoRepository repoRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.repoRepository = repoRepository;
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return "Login successful";
    }
}
