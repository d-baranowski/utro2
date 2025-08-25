-- Test data setup for Cypress tests
-- This script creates test users and organizations needed for E2E tests

-- Clean up any existing test data
DELETE FROM organisation_member WHERE user_id IN (
    SELECT id FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin')
);
DELETE FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin');
DELETE FROM organisation WHERE name IN ('Test Organisation', 'Second Test Org', 'Admin Org');

-- Create test organizations with UUIDs
INSERT INTO organisation (id, name, description, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'Test Organisation', 'Primary test organisation for Cypress tests', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'Second Test Org', 'Secondary test organisation for switching tests', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'Admin Org', 'Admin organisation for admin user tests', NOW(), NOW());

-- Create test users with BCrypt hashed passwords and UUIDs
-- testuser: testpass -> $2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.
-- testuser2: testpass2 -> $2b$12$clID0ES4V1DCGNbvQ8a/9uW.zREIZlf.aJEuf6KteKOH/dNsCH3w.
-- admin: adminpass -> $2b$12$9H06cTbYIDr8khr0oJh80enQ9308s4eGO/vlJfzyRFj5VH79m2xjm
INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'testuser', 'testuser@example.com', 'Test User', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'testuser2', 'testuser2@example.com', 'Test User 2', 'local', '$2b$12$clID0ES4V1DCGNbvQ8a/9uW.zREIZlf.aJEuf6KteKOH/dNsCH3w.', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'admin', 'admin@example.com', 'Admin User', 'local', '$2b$12$9H06cTbYIDr8khr0oJh80enQ9308s4eGO/vlJfzyRFj5VH79m2xjm', NOW(), NOW());

-- Create organisation memberships with proper enum values
INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
-- testuser is admin of first org
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'ADMINISTRATOR', NOW()),
-- testuser is member of second org
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'MEMBER', NOW()),
-- testuser2 is member of first org
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MEMBER', NOW()),
-- admin is admin of admin org
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'ADMINISTRATOR', NOW());

-- Display created test data for verification
SELECT 'Test Organizations:' as info;
SELECT id, name, description FROM organisation WHERE name LIKE '%Test%' OR name = 'Admin Org';

SELECT 'Test Users:' as info;
SELECT id, username, email, full_name FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin');

SELECT 'Organisation Memberships:' as info;
SELECT 
    u.username,
    o.name as organisation_name,
    om.member_type,
    om.joined_at
FROM organisation_member om
JOIN "user" u ON om.user_id = u.id
JOIN organisation o ON om.organisation_id = o.id
WHERE u.username IN ('testuser', 'testuser2', 'admin')
ORDER BY u.username, o.name;