package com.portfolio.backend.auth.service;

import com.portfolio.backend.auth.dto.AuthResponse;
import com.portfolio.backend.auth.dto.LoginRequest;
import com.portfolio.backend.auth.dto.SignupRequest;
import com.portfolio.backend.auth.dto.UpdateProfileRequest;
import com.portfolio.backend.auth.dto.UserProfileResponse;
import com.portfolio.backend.auth.entity.User;
import com.portfolio.backend.auth.repository.UserRepository;
import com.portfolio.backend.config.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .organization(request.getOrganization())
                .githubUrl(request.getGithubUrl())
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        String accessToken  = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return toAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String accessToken  = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return toAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        String newAccessToken  = jwtTokenProvider.generateAccessToken(email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(email);

        return toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        return new UserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername().trim());
        }
        user.setOrganization(request.getOrganization());
        user.setGithubUrl(request.getGithubUrl());

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return new UserProfileResponse(user);
    }

    private AuthResponse toAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .id(user.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .username(user.getUsername())
                .organization(user.getOrganization())
                .githubUrl(user.getGithubUrl())
                .role(user.getRole().name())
                .build();
    }
}
