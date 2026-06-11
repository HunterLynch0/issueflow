package com.lynch.issuetrackerapi.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "repository_invitations")
public class RepoInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Repo repo;

    @ManyToOne
    private User invitedUser;

    @ManyToOne
    private User invitedBy;

    @Enumerated(EnumType.STRING)
    private RepoInvitationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
