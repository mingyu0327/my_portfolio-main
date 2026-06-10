# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack portfolio website: React/TypeScript frontend (port 3000) + Spring Boot backend (port 8080) with MySQL and JWT authentication.

## Commands

### Frontend (`frontend/`)
```powershell
npm start          # Dev server → http://localhost:3000
npm run build      # Production bundle
npm test           # Jest tests
```

### Backend (`backend/`)
```powershell
./gradlew bootRun  # Spring Boot server → http://localhost:8080
./gradlew build    # Build .jar
./gradlew test     # JUnit 5 tests
# Windows: use gradlew.bat instead of ./gradlew
```

### Run both together
Use the VSCode task **"🚀 Run Both (Frontend + Backend)"** defined in `portfolio.code-workspace`.

## Architecture

### Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Spring Boot 3.4.3, Java 17, Spring Security, Spring Data JPA, MySQL
- **Auth:** JWT (JJWT 0.12.3), BCrypt, stateless (no sessions)

### Auth Flow
1. User logs in → `POST /api/auth/login` → backend returns `accessToken` (24h) + `refreshToken` (7d)
2. Frontend stores tokens in localStorage as `portfolio_access_token` / `portfolio_refresh_token`
3. Every API request sends `Authorization: Bearer <token>`
4. `JwtAuthenticationFilter` validates the token on each request
5. `/api/auth/**` routes are public; all others require a valid JWT

Key auth files:
- [JwtTokenProvider.java](backend/src/main/java/com/portfolio/backend/config/jwt/JwtTokenProvider.java) — token generation/validation
- [JwtAuthenticationFilter.java](backend/src/main/java/com/portfolio/backend/config/jwt/JwtAuthenticationFilter.java) — per-request filter
- [SecurityConfig.java](backend/src/main/java/com/portfolio/backend/config/SecurityConfig.java) — Spring Security chain
- [AuthController.java](backend/src/main/java/com/portfolio/backend/auth/controller/AuthController.java) — `/api/auth/*` endpoints
- [auth.ts](frontend/src/api/auth.ts) — frontend API client and token storage

### Frontend Data Flow
- Portfolio content (sections, text, projects, skills) lives in **localStorage** per user: key `portfolio_v2_{username}`
- User profile data is synced between localStorage and the backend `User` entity
- No global state library — pure React hooks (`useState`, `useEffect`, `useCallback`)
- `App.tsx` is the monolithic main component (~1000+ lines) containing all portfolio sections

### Backend Data Model
Single `User` JPA entity: `id`, `email`, `password` (BCrypt), `username`, `role`, `createdAt`. Schema is managed by `spring.jpa.hibernate.ddl-auto=update`.

## Configuration

Backend config is in `application.properties`. Sensitive values use environment variables:

| Env Var | Purpose | Default (dev only) |
|---------|---------|-------------------|
| `DB_PASSWORD` | MySQL password | *(empty)* |
| `JWT_SECRET` | JWT signing key | hardcoded dev key |

Database: MySQL at `localhost:3306/portfolio_db`, user `root`.

CORS is restricted to `http://localhost:3000`. To change, update `cors.allowed-origins` in `application.properties` and `SecurityConfig.java`.

## Key Conventions

- Frontend API base URL is hardcoded as `http://localhost:8080/api` in [auth.ts](frontend/src/api/auth.ts)
- Tailwind dark mode uses the `class` strategy — toggle by adding/removing `dark` class on `<html>`
- The frontend editable intro section uses the browser's native `contentEditable` API (no rich text library)
