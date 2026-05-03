package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    public List<Issue> findByRepoId(Long repositoryId);

}