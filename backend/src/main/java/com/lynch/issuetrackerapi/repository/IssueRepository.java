package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    Optional<Issue> findByIdAndRepoOwnerEmail(Long issueId, String email);

    List<Issue> findByRepoIdAndRepoOwnerEmail(Long repoId, String email);

    List<Issue> findByRepoIdAndStatusAndRepoOwnerEmail(Long repoId, String status, String email);

    List<Issue> findByRepoId(long id);

    List<Issue> findByRepoIdAndStatus(Long repoId, String status);
}