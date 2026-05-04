package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.IssueRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/{id}")
    public User getIssue(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

}
