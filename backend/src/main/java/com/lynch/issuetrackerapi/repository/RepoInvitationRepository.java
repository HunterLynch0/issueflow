package com.lynch.issuetrackerapi.repository;

import com.lynch.issuetrackerapi.model.Repo;
import com.lynch.issuetrackerapi.model.RepoInvitation;
import com.lynch.issuetrackerapi.model.RepoInvitationStatus;
import com.lynch.issuetrackerapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepoInvitationRepository extends JpaRepository<RepoInvitation, Long> {

    boolean existsByRepoAndInvitedUserAndStatus(Repo repo, User invitedUser, RepoInvitationStatus status);

    List<RepoInvitation> findByInvitedUserAndStatusOrderByCreatedAtDesc(User invitedUser, RepoInvitationStatus status);

    List<RepoInvitation> findByRepo(Repo repo);
}
