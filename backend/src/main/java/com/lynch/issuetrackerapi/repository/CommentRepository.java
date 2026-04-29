package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

}
