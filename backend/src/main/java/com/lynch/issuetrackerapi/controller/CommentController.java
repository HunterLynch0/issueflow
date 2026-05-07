package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Comment;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.model.User;
import com.lynch.issuetrackerapi.repository.CommentRepository;
import com.lynch.issuetrackerapi.repository.IssueRepository;
import com.lynch.issuetrackerapi.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, IssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @PostMapping("/issues/{issueId}/comments")
    public Comment createComment(@PathVariable Long issueId, @RequestBody Comment comment) {
        User owner = getCurrentUser();

        Issue issue = issueRepository.findByIdAndRepoOwnerEmail(issueId, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        comment.setIssue(issue);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @GetMapping("/issues/{issueId}/comments")
    public List<Comment> getComments(@PathVariable Long issueId) {
        User owner = getCurrentUser();

        return commentRepository.findByIssueIdAndIssueRepoOwnerEmail(issueId, owner.getEmail());
    }

    @PatchMapping("/comments/{commentId}")
    public Comment updateComment(@PathVariable Long commentId, @RequestBody Comment updatedComment) {
        User owner = getCurrentUser();

        Comment comment = commentRepository.findByIdAndIssueRepoOwnerEmail(commentId, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (updatedComment.getContent() != null) {
            comment.setContent(updatedComment.getContent());
        }

        return commentRepository.save(comment);
    }

    @DeleteMapping("comments/{commentId}")
    public void deleteComment(@PathVariable Long commentId) {
        User owner = getCurrentUser();

        Comment comment = commentRepository.findByIdAndIssueRepoOwnerEmail(commentId, owner.getEmail()).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        commentRepository.delete(comment);
    }
}
