package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.IssueRepository;
import com.lynch.issuetrackerapi.repository.RepoRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class IssueController {

    private final IssueRepository issueRepository;
    private final RepoRepository repoRepository;
    private final UserRepository userRepository;

    public IssueController(IssueRepository issueRepository, RepoRepository repoRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.repoRepository = repoRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/repositories/{repoId}/issues")
    public Issue createIssue(@PathVariable Long repoId, @RequestBody Issue issue) {
        Repo repo = repoRepository.findById(repoId).orElseThrow(() -> new ResourceNotFoundException("Repository not found"));

        issue.setRepo(repo);
        issue.setCreatedAt(LocalDateTime.now());
        if(issue.getStatus() == null) {
            issue.setStatus("OPEN");
        }

        return issueRepository.save(issue);
    }

    @GetMapping("/repositories/{repoId}/issues")
    public List<Issue> getIssuesByRepository(@PathVariable Long repoId, @RequestParam(required = false) String status) {
        if(status != null) {
            return issueRepository.findByRepoIdAndStatus(repoId, status);
        }

        return issueRepository.findByRepoId(repoId);
    }

    @GetMapping("/issues/{id}")
    public Issue getIssue(@PathVariable Long id) {
        return issueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
    }

    @PatchMapping("/issues/{issueId}/assign/{userId}")
    public Issue assignUser(@PathVariable Long issueId, @PathVariable Long userId) {

        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        issue.setAssignee(user);

        return issueRepository.save(issue);
    }

    @PatchMapping("/issues/{issueId}/close")
    public Issue closeIssue(@PathVariable Long issueId) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new ResourceNotFoundException("Issue not found."));

        issue.setStatus("CLOSED");

        return issueRepository.save(issue);
    }

    @PatchMapping("/issues/{issueId}/reopen")
    public Issue reopenIssue(@PathVariable Long issueId) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new ResourceNotFoundException("Issue not found."));

        issue.setStatus("OPEN");

        return issueRepository.save(issue);
    }
}
