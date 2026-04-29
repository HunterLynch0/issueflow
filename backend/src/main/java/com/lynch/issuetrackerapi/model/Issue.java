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
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;
    private String desc;

    private String status;

    private LocalDateTime createdAt;

    @ManyToOne
    private Repo repo;

    @ManyToOne
    private User assignee;
}
