package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.repository.RepoRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/repositories")
public class RepoController {

    private final RepoRepository repoRepository;

    public RepoController(RepoRepository repoRepository) {
        this.repoRepository = repoRepository;
    }

    @PostMapping
    public Repo createRepository(@RequestBody Repo repo) {
        repo.setCreatedAt(LocalDateTime.now());
        return repoRepository.save(repo);
    }

    @GetMapping
    public List<Repo> getAllRepositories() {
        return repoRepository.findAll();
    }
}
