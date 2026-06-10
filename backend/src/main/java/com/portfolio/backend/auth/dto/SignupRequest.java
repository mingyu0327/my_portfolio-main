package com.portfolio.backend.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequest {

    private String email;
    private String password;
    private String username;
    private String organization;
    private String githubUrl;
}
