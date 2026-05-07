package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueIdAndIssueRepoOwnerEmail(Long issueId, String email);

    Optional<Comment> findByIdAndIssueRepoOwnerEmail(Long commentId, String email);

}
