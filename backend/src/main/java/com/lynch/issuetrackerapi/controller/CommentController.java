package com.lynch.issuetrackerapi.controller;

import com.lynch.issuetrackerapi.exception.ResourceNotFoundException;
import com.lynch.issuetrackerapi.model.Comment;
import com.lynch.issuetrackerapi.model.Issue;
import com.lynch.issuetrackerapi.repository.CommentRepository;
import com.lynch.issuetrackerapi.repository.IssueRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;


    public CommentController(CommentRepository commentRepository, IssueRepository issueRepository) {
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
    }

    @PostMapping("/issues/{issueId}/comments")
    public Comment createComment(@PathVariable Long issueId, @RequestBody Comment comment) {
        Issue issue = issueRepository.findById(issueId).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        comment.setIssue(issue);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @GetMapping("/issues/{issueId}/comments")
    public List<Comment> getComments(@PathVariable Long issueId) {
        return commentRepository.findByIssueId(issueId);
    }
}
