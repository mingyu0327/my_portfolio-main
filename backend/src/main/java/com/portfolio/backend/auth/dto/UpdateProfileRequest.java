package com.portfolio.backend.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {
    private String username;
    private String organization;
    private String githubUrl;
    private String currentPassword;  // 비밀번호 변경 시 현재 비밀번호 확인용
    private String newPassword;      // 비어있으면 비밀번호 변경 안 함
}
