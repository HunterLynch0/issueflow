package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.RepoMember;
import com.lynch.issuetrackerapi.model.User;

import java.util.List;
import java.util.Optional;

public interface RepoMemberRepository {

    boolean existsByRepoAndUser(Repo repo, User user);

    boolean existsByRepoIdAndUserEmail(Long repoId, String email);

    Optional<RepoMember> findByRepoAndUser(Repo repo, User user);

    List<RepoMember> findByRepoId(Long repoId);
}
