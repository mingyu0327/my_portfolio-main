package com.portfolio.backend.auth.dto;

import com.portfolio.backend.auth.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponse {
    private final Long          id;
    private final String        email;
    private final String        username;
    private final String        organization;
    private final String        githubUrl;
    private final String        role;
    private final LocalDateTime createdAt;

    public UserProfileResponse(User user) {
        this.id           = user.getId();
        this.email        = user.getEmail();
        this.username     = user.getUsername();
        this.organization = user.getOrganization();
        this.githubUrl    = user.getGithubUrl();
        this.role         = user.getRole().name();
        this.createdAt    = user.getCreatedAt();
    }
}
