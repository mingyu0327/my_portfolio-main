package com.portfolio.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {

    private Long   id;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String email;
    private String username;
    private String organization;
    private String githubUrl;
    private String role;
}
