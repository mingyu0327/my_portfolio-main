package com.portfolio.backend.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-expiration}") long refreshTokenExpiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(String email) {
        return buildToken(email, accessTokenExpiration, "access");
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, refreshTokenExpiration, "refresh");
    }

    private String buildToken(String email, long expiration, String tokenType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                .claim("type", tokenType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("잘못된 형식의 JWT 토큰: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("잘못된 JWT 서명: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 비어있음: {}", e.getMessage());
        }
        return false;
    }

    public boolean isTokenExpired(String token) {
        try {
            parseClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
