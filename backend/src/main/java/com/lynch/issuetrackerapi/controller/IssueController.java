package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.IssueRepository;
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
@RequestMapping("/api")
public class IssueController {

    private final IssueRepository issueRepository;
    private final RepoRepository repoRepository;
    private final UserRepository userRepository;
    private final RepoMemberRepository repoMemberRepository;

    public IssueController(IssueRepository issueRepository, RepoRepository repoRepository, UserRepository userRepository, RepoMemberRepository repoMemberRepository) {
        this.issueRepository = issueRepository;
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

    private Issue getAccessibleIssue(Long issueId, User user) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        getAccessibleRepo(issue.getRepo().getId(), user);

        return issue;
    }

    private Repo getOwnedRepo(Long repoId, User user) {
        Repo repo = repoRepository.findById(repoId).orElseThrow(() -> new ResourceNotFoundException("Repo not found"));

        if(!repo.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can do this");
        }

        return repo;
    }

    @PostMapping("/repositories/{repoId}/issues")
    public Issue createIssue(@PathVariable Long repoId, @RequestBody Issue issue) {
        User user = getCurrentUser();

        Repo repo = getAccessibleRepo(repoId, user);

        issue.setRepo(repo);
        issue.setCreatedAt(LocalDateTime.now());
        if(issue.getStatus() == null) {
            issue.setStatus("OPEN");
        }

        return issueRepository.save(issue);
    }

    @GetMapping("/repositories/{repoId}/issues")
    public List<Issue> getIssuesByRepository(@PathVariable Long repoId, @RequestParam(required = false) String status) {
        User user = getCurrentUser();

        Repo repo = getAccessibleRepo(repoId, user);

        if(status != null) {
            return issueRepository.findByRepoIdAndStatus(repo.getId(), status);
        }

        return issueRepository.findByRepoId(repo.getId());
    }

    @GetMapping("/issues/{id}")
    public Issue getIssue(@PathVariable Long id) {
        User user = getCurrentUser();

        return getAccessibleIssue(id, user);
    }

    @PatchMapping("/issues/{issueId}/assign/{userId}")
    public Issue assignUser(@PathVariable Long issueId, @PathVariable Long userId) {
        User user = getCurrentUser();

        Issue issue = getAccessibleIssue(issueId, user);

        Repo repo = issue.getRepo();

        User userAssigned = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean inRepo = repo.getOwner().getId().equals(userAssigned.getId()) || repoMemberRepository.existsByRepoAndUser(repo, userAssigned);

        if(!inRepo) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not part of this repository");
        }

        issue.setAssignee(userAssigned);

        return issueRepository.save(issue);
    }

    @PatchMapping("/issues/{issueId}/close")
    public Issue closeIssue(@PathVariable Long issueId) {
        User user = getCurrentUser();

        Issue issue = getAccessibleIssue(issueId, user);

        issue.setStatus("CLOSED");

        return issueRepository.save(issue);
    }

    @PatchMapping("/issues/{issueId}/reopen")
    public Issue reopenIssue(@PathVariable Long issueId) {
        User user = getCurrentUser();

        Issue issue = getAccessibleIssue(issueId, user);

        issue.setStatus("OPEN");

        return issueRepository.save(issue);
    }

    @PatchMapping("/issues/{issueId}")
    public Issue updateIssue(@PathVariable Long issueId, @RequestBody Issue updatedIssue) {
        User user = getCurrentUser();

        Issue issue = getAccessibleIssue(issueId, user);

        if (updatedIssue.getTitle() != null) {
            issue.setTitle(updatedIssue.getTitle());
        }

        if (updatedIssue.getDescription() != null) {
            issue.setDescription(updatedIssue.getDescription());
        }

        if (updatedIssue.getStatus() != null) {
            issue.setStatus(updatedIssue.getStatus());
        }

        return issueRepository.save(issue);
    }

    @DeleteMapping("/issues/{issueId}")
    public void deleteIssue(@PathVariable Long issueId) {
        User user = getCurrentUser();

        Issue issue = getAccessibleIssue(issueId, user);

        issueRepository.delete(issue);
    }
}
