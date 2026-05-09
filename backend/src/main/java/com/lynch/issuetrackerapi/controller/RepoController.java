package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.dto.AddMemberRequest;
import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.RepoMember;
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
        boolean isOwner = repo.getOwner() != null && repo.getOwner().getId().equals(user.getId());
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

    @PostMapping("/{repoId}/members/")
    public RepoMember addMemberByEmail(@PathVariable Long repoId, @RequestBody AddMemberRequest request) {
        User user = getCurrentUser();

        Repo repo = getOwnedRepo(repoId, user);

        User userAdded = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(repo.getOwner().getId().equals(userAdded.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner is already in the repository");
        }

        if(repoMemberRepository.existsByRepoAndUser(repo, userAdded)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a member");
        }

        RepoMember member = new RepoMember();
        member.setRepo(repo);
        member.setUser(userAdded);

        return repoMemberRepository.save(member);
    }

    @DeleteMapping("/{repoId}/members/{userId}")
    public void removeMember(@PathVariable Long repoId, @PathVariable Long userId) {
        User user = getCurrentUser();

        Repo repo = getOwnedRepo(repoId, user);

        User userRemoved = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RepoMember member = repoMemberRepository.findByRepoAndUser(repo, userRemoved).orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        repoMemberRepository.delete(member);
    }

    @GetMapping
    public List<Repo> getAllRepositories() {
        User user = getCurrentUser();

        List<Repo> repos = repoRepository.findAll();

        return repos.stream().filter(repo -> canAccessRepo(repo, user)).toList();
    }

    @GetMapping("/{id}")
    public Repo getRepo(@PathVariable Long id) {
        User user = getCurrentUser();

        return getAccessibleRepo(id, user);
    }

    @GetMapping("/{repoId}/members")
    public List<RepoMember> getMembers(@PathVariable Long repoId) {
        User user = getCurrentUser();

        Repo repo = getAccessibleRepo(repoId, user);

        return repoMemberRepository.findByRepo(repo);
    }

    @PatchMapping("/{id}")
    public Repo updateRepo(@PathVariable Long id, @RequestBody Repo updatedRepo) {
        User owner = getCurrentUser();

        Repo repo = getOwnedRepo(id, owner);

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

        Repo repo = getOwnedRepo(id, owner);

        repoRepository.delete(repo);
    }

}
