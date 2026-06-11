package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.dto.AddMemberRequest;
import com.lynch.issuetrackerapi.dto.RepoInvitationResponse;
import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.*;
import com.lynch.issuetrackerapi.repository.*;
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
    private final RepoInvitationRepository repoInvitationRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;

    public RepoController(RepoRepository repoRepository, UserRepository userRepository, RepoMemberRepository repoMemberRepository,
                          RepoInvitationRepository repoInvitationRepository, IssueRepository issueRepository,
                          CommentRepository commentRepository) {
        this.repoRepository = repoRepository;
        this.userRepository = userRepository;
        this.repoMemberRepository = repoMemberRepository;
        this.repoInvitationRepository = repoInvitationRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
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

    private RepoInvitationResponse toInvitationResponse(RepoInvitation invitation) {
        return new RepoInvitationResponse(invitation);
    }

    private void unassignIssuesForLeavingUser(Repo repo, User user) {
        List<Issue> assignedIssues = issueRepository.findByRepoAndAssignee(repo, user);

        assignedIssues.forEach(issue -> {
            // Assignments should only point at users who can access the repository.
            issue.setAssignee(null);
            issueRepository.save(issue);
        });
    }

    @PostMapping
    public Repo createRepository(@RequestBody Repo repo) {
        User owner = getCurrentUser();

        repo.setOwner(owner);
        repo.setCreatedAt(LocalDateTime.now());

        return repoRepository.save(repo);
    }

    @GetMapping("/invitations")
    public List<RepoInvitationResponse> getPendingInvitations() {
        User user = getCurrentUser();

        return repoInvitationRepository
                .findByInvitedUserAndStatusOrderByCreatedAtDesc(user, RepoInvitationStatus.PENDING)
                .stream()
                .map(this::toInvitationResponse)
                .toList();
    }

    @PatchMapping("/invitations/{invitationId}/accept")
    public RepoInvitationResponse acceptInvitation(@PathVariable Long invitationId) {
        User user = getCurrentUser();

        RepoInvitation invitation = repoInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only accept invitations sent to you");
        }

        if (invitation.getStatus() != RepoInvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is no longer pending");
        }

        Repo repo = invitation.getRepo();

        if (!repo.getOwner().getId().equals(user.getId()) && !repoMemberRepository.existsByRepoAndUser(repo, user)) {
            RepoMember member = new RepoMember();
            member.setRepo(repo);
            member.setUser(user);
            repoMemberRepository.save(member);
        }

        invitation.setStatus(RepoInvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());

        return toInvitationResponse(repoInvitationRepository.save(invitation));
    }

    @PatchMapping("/invitations/{invitationId}/decline")
    public RepoInvitationResponse declineInvitation(@PathVariable Long invitationId) {
        User user = getCurrentUser();

        RepoInvitation invitation = repoInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!invitation.getInvitedUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only decline invitations sent to you");
        }

        if (invitation.getStatus() != RepoInvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation is no longer pending");
        }

        invitation.setStatus(RepoInvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());

        return toInvitationResponse(repoInvitationRepository.save(invitation));
    }

    @PostMapping("/{repoId}/members")
    public RepoInvitationResponse addMemberByEmail(@PathVariable Long repoId, @RequestBody AddMemberRequest request) {
        User user = getCurrentUser();

        Repo repo = getOwnedRepo(repoId, user);

        User userAdded = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(repo.getOwner().getId().equals(userAdded.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner is already in the repository");
        }

        if(repoMemberRepository.existsByRepoAndUser(repo, userAdded)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already a member");
        }

        if(repoInvitationRepository.existsByRepoAndInvitedUserAndStatus(repo, userAdded, RepoInvitationStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already has a pending invitation");
        }

        RepoInvitation invitation = new RepoInvitation();
        invitation.setRepo(repo);
        invitation.setInvitedUser(userAdded);
        invitation.setInvitedBy(user);
        invitation.setStatus(RepoInvitationStatus.PENDING);
        invitation.setCreatedAt(LocalDateTime.now());

        return toInvitationResponse(repoInvitationRepository.save(invitation));
    }

    @DeleteMapping("/{repoId}/members/{userId}")
    public void removeMember(@PathVariable Long repoId, @PathVariable Long userId) {
        User user = getCurrentUser();

        Repo repo = getOwnedRepo(repoId, user);

        User userRemoved = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RepoMember member = repoMemberRepository.findByRepoAndUser(repo, userRemoved).orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        unassignIssuesForLeavingUser(repo, userRemoved);

        repoMemberRepository.delete(member);
    }

    @PostMapping("/{repoId}/leave")
    public void leaveRepository(@PathVariable Long repoId) {
        User user = getCurrentUser();

        Repo repo = getAccessibleRepo(repoId, user);

        if(repo.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Repository owner cannot leave their own repository");
        }

        RepoMember member = repoMemberRepository.findByRepoAndUser(repo, user)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        unassignIssuesForLeavingUser(repo, user);

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

        List<Issue> issues = issueRepository.findByRepoId(repo.getId());

        issues.forEach(issue -> {
            List<Comment> comments = commentRepository.findByIssueId(issue.getId());
            comments.forEach(commentRepository::delete);
            issueRepository.delete(issue);
        });

        List<RepoMember> members = repoMemberRepository.findByRepo(repo);

        members.forEach(repoMemberRepository::delete);

        List<RepoInvitation> invitations = repoInvitationRepository.findByRepo(repo);

        invitations.forEach(repoInvitationRepository::delete);

        repoRepository.delete(repo);
    }

}
