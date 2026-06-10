package com.portfolio.backend.auth.controller;

import com.portfolio.backend.auth.dto.AuthResponse;
import com.portfolio.backend.auth.dto.LoginRequest;
import com.portfolio.backend.auth.dto.SignupRequest;
import com.portfolio.backend.auth.dto.UpdateProfileRequest;
import com.portfolio.backend.auth.dto.UserProfileResponse;
import com.portfolio.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.refresh(body.get("refreshToken")));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
    }
}
