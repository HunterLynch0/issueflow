package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Issue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, Long> {

}
