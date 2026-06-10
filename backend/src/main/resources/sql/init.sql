-- =============================================================
-- H2-compatible DB initialization script
-- Drops existing tables and recreates `users` and `refresh_tokens`
-- =============================================================

DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    organization VARCHAR(100),
    github_url VARCHAR(255),
    created_at TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Minimal indexes/uniques used by application
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token ON refresh_tokens(token);