package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    public List<Comment> findByIssueId(Long issueId);

}
