package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Repo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoRepository extends JpaRepository<Repo, Long> {

}
