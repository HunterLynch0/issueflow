package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.RepoMemberRepository;
import com.lynch.issuetrackerapi.repository.RepoRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/repositories")
public class RepoController {

    private final RepoRepository repoRepository;
    private final UserRepository userRepository;
    private final RepoMemberRepository repoMemberRepository;

    public RepoController(RepoRepository repoRepository, UserRepository userRepository, RepoMemberRepository repoMemberRepository) {
        this.repoRepository = repoRepository;
        this.userRepository = userRepository;
        this.repoMemberRepository = repoMemberRepository;
    }

    public User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean canAccessRepo(Repo repo, User user) {
        boolean isOwner = repo.getOwner().getId().equals(user.getId());
        boolean isMember = repoMemberRepository.existsByRepoAndUser(repo, user);

        return isOwner || isMember;
    }

    private Repo getAccessibleRepo(Long repoId, User user) {
        Repo repo = repoRepository.findById(repoId).orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        if(!canAccessRepo(repo, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this repository");
        }

        return repo;
    }

    private Repo getOwnedRepo(Long repoId, User user) {
        Repo repo = repoRepository.findById(repoId).orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        if(!repo.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can do this");
        }

        return repo;
    }

    @PostMapping
    public Repo createRepository(@RequestBody Repo repo) {
        User owner = getCurrentUser();

        repo.setOwner(owner);
        repo.setCreatedAt(LocalDateTime.now());

        return repoRepository.save(repo);
    }

    @GetMapping
    public List<Repo> getAllRepositories() {
        User owner = getCurrentUser();
        return repoRepository.findByOwnerEmail(owner.getEmail());
    }

    @GetMapping("/{id}")
    public Repo getRepo(@PathVariable Long id) {
        User owner = getCurrentUser();

        return repoRepository.findByIdAndOwnerEmail(id, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));
    }

    @PatchMapping("/{id}")
    public Repo updateRepo(@PathVariable Long id, @RequestBody Repo updatedRepo) {
        User owner = getCurrentUser();

        Repo repo = repoRepository.findByIdAndOwnerEmail(id, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

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
        User owner = getCurrentUser();

        Repo repo = repoRepository.findByIdAndOwnerEmail(id, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

        repoRepository.delete(repo);
    }

}
