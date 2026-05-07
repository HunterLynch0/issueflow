package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.RepoRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/repositories")
public class RepoController {

    private final RepoRepository repoRepository;
    private final UserRepository userRepository;

    public RepoController(RepoRepository repoRepository, UserRepository userRepository) {
        this.repoRepository = repoRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Repo createRepository(@RequestBody Repo repo) {
        repo.setCreatedAt(LocalDateTime.now());
        return repoRepository.save(repo);
    }

    @GetMapping
    public User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public List<Repo> getAllRepositories() {
        User owner = getCurrentUser();
        return repoRepository.findByOwnerEmail(owner.getEmail());
    }

    @GetMapping("/{id}")
    public Repo getRepo(@PathVariable Long id) {
        return repoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));
    }

    @PatchMapping("/{id}")
    public Repo updateRepo(@PathVariable Long id, @RequestBody Repo updatedRepo) {
        Repo repo = repoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

        if (updatedRepo.getName() != null) {
            repo.setName(updatedRepo.getName());
        }

        if (updatedRepo.getDescription() != null) {
            repo.setDescription(updatedRepo.getDescription());
        }

        return repoRepository.save(repo);
    }

    @DeleteMapping("/{id}")
    public void deleteRepo(@PathVariable Long id) {
        Repo repo = repoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

        repoRepository.delete(repo);
    }

}
