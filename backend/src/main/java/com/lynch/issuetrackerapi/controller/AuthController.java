package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.dto.AuthResponse;
import com.lynch.issuetrackerapi.dto.LoginRequest;
import com.lynch.issuetrackerapi.dto.RegisterRequest;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.UserRepository;
import com.lynch.issuetrackerapi.service.EmailService;
import com.lynch.issuetrackerapi.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        String token = UUID.randomUUID().toString();

        user.setEmailVerified(false);
        user.setVerificationToken(token);

        emailService.sendVerificationEmail(user.getEmail(), token);

        userRepository.save(user);

        return ResponseEntity.ok("Account created. Check your email to verify you account.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if(!user.isEmailVerified()) {
            return ResponseEntity.status(403).body("Please verify your email before logging in");
        }

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail()));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {

        Optional<User> optionalUser = userRepository.findByVerificationToken(token);

        if(optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        User user = optionalUser.get();

        user.setEmailVerified(true);
        user.setVerificationToken(null);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }
}
