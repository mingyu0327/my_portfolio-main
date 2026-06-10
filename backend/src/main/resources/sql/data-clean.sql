-- Delete test users by email patterns used during development
DELETE FROM refresh_tokens; -- clear tokens first due FK
DELETE FROM users WHERE email LIKE '%@example.com' OR email LIKE '%test%';
