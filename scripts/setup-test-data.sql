-- Test data setup for Cypress tests
-- This script creates test users and organizations needed for E2E tests

-- Clean up any existing test data
DELETE FROM organisation_member WHERE user_id IN (
    SELECT id FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin')
);
DELETE FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin');
DELETE FROM organisation WHERE name IN ('Test Organisation', 'Second Test Org', 'Admin Org');

-- Create test organizations
INSERT INTO organisation (id, name, description, created_at, updated_at) VALUES
('test_org_1', 'Test Organisation', 'Primary test organisation for Cypress tests', NOW(), NOW()),
('test_org_2', 'Second Test Org', 'Secondary test organisation for switching tests', NOW(), NOW()),
('admin_org', 'Admin Org', 'Admin organisation for admin user tests', NOW(), NOW());

-- Create test users with BCrypt hashed passwords
-- testuser: testpass -> $2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.
-- testuser2: testpass2 -> $2b$12$clID0ES4V1DCGNbvQ8a/9uW.zREIZlf.aJEuf6KteKOH/dNsCH3w.
-- admin: adminpass -> $2b$12$9H06cTbYIDr8khr0oJh80enQ9308s4eGO/vlJfzyRFj5VH79m2xjm
INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
('testuser_id', 'testuser', 'testuser@example.com', 'Test User', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('testuser2_id', 'testuser2', 'testuser2@example.com', 'Test User 2', 'local', '$2b$12$clID0ES4V1DCGNbvQ8a/9uW.zREIZlf.aJEuf6KteKOH/dNsCH3w.', NOW(), NOW()),
('admin_id', 'admin', 'admin@example.com', 'Admin User', 'local', '$2b$12$9H06cTbYIDr8khr0oJh80enQ9308s4eGO/vlJfzyRFj5VH79m2xjm', NOW(), NOW());

-- Create organisation memberships
INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
-- testuser is admin of first org
('testuser_id', 'test_org_1', 'MEMBER_TYPE_ADMINISTRATOR', NOW()),
-- testuser is member of second org
('testuser_id', 'test_org_2', 'MEMBER_TYPE_MEMBER', NOW()),
-- testuser2 is member of first org
('testuser2_id', 'test_org_1', 'MEMBER_TYPE_MEMBER', NOW()),
-- admin is admin of admin org
('admin_id', 'admin_org', 'MEMBER_TYPE_ADMINISTRATOR', NOW());

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