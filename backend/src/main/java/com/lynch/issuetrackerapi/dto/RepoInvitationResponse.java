package com.lynch.issuetrackerapi.dto;

import com.lynch.issuetrackerapi.model.RepoInvitation;

import java.time.LocalDateTime;

public class RepoInvitationResponse {

    private Long id;
    private Long repoId;
    private String repoName;
    private String repoDescription;
    private Long invitedById;
    private String invitedByEmail;
    private String invitedByUsername;
    private String status;
    private LocalDateTime createdAt;

    public RepoInvitationResponse(RepoInvitation invitation) {
        this.id = invitation.getId();
        this.status = invitation.getStatus() == null ? null : invitation.getStatus().name();
        this.createdAt = invitation.getCreatedAt();

        if (invitation.getRepo() != null) {
            this.repoId = invitation.getRepo().getId();
            this.repoName = invitation.getRepo().getName();
            this.repoDescription = invitation.getRepo().getDescription();
        }

        if (invitation.getInvitedBy() != null) {
            this.invitedById = invitation.getInvitedBy().getId();
            this.invitedByEmail = invitation.getInvitedBy().getEmail();
            this.invitedByUsername = invitation.getInvitedBy().getUsername();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getRepoId() {
        return repoId;
    }

    public String getRepoName() {
        return repoName;
    }

    public String getRepoDescription() {
        return repoDescription;
    }

    public Long getInvitedById() {
        return invitedById;
    }

    public String getInvitedByEmail() {
        return invitedByEmail;
    }

    public String getInvitedByUsername() {
        return invitedByUsername;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
