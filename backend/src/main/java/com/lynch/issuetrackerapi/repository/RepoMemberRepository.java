package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.RepoMember;
import com.lynch.issuetrackerapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RepoMemberRepository extends JpaRepository<RepoMember, Long> {

    boolean existsByRepoAndUser(Repo repo, User user);

    boolean existsByRepoIdAndUserEmail(Long repoId, String email);

    Optional<RepoMember> findByRepoAndUser(Repo repo, User user);

    List<RepoMember> findByRepo(Repo repo);
}
