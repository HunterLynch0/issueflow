package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Repo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepoRepository extends JpaRepository<Repo, Long> {

    Optional<Repo> findByIdAndOwnerEmail(Long id, String email);

    List<Repo> findByOwnerEmail(String email);

}
