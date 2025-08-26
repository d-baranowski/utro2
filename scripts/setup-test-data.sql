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

-- Create some sample specializations
INSERT INTO specialization (id, name_eng, name_pl, category, created_at, updated_at) VALUES
('spec1111-1111-1111-1111-111111111111'::uuid, 'Anxiety Disorders', 'Zaburzenia lękowe', 'Mental Health', NOW(), NOW()),
('spec2222-2222-2222-2222-222222222222'::uuid, 'Depression Treatment', 'Leczenie depresji', 'Mental Health', NOW(), NOW()),
('spec3333-3333-3333-3333-333333333333'::uuid, 'Couple Therapy', 'Terapia par', 'Relationships', NOW(), NOW()),
('spec4444-4444-4444-4444-444444444444'::uuid, 'Trauma Therapy', 'Terapia traumy', 'Trauma', NOW(), NOW());

-- Create additional therapist users
INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'therapist1', 'therapist1@example.com', 'Dr. Sarah Johnson', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'therapist2', 'therapist2@example.com', 'Dr. Michael Brown', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'therapist3', 'therapist3@example.com', 'Dr. Anna Kowalski', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW());

-- Add therapist users to organisations as members
INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MEMBER', NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MEMBER', NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'MEMBER', NOW());

-- Create sample therapist profiles
INSERT INTO therapist (
    id, user_id, organisation_id, professional_title, description_eng, description_pl,
    work_experience_eng, work_experience_pl, languages, in_person_therapy_format,
    online_therapy_format, contact_email, contact_phone, website_url,
    is_accepting_new_clients, visibility, slug, search_tags, meta_description,
    is_active, published_at, created_at, updated_at
) VALUES
(
    'ther1111-1111-1111-1111-111111111111'::uuid,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Clinical Psychologist',
    'Specializing in anxiety and depression treatment with over 10 years of experience.',
    'Specjalizuję się w leczeniu lęku i depresji z ponad 10-letnim doświadczeniem.',
    'PhD in Clinical Psychology, 10+ years treating anxiety disorders',
    'Doktor psychologii klinicznej, 10+ lat leczenia zaburzeń lękowych',
    ARRAY['English', 'Polish'],
    true,
    true,
    'sarah.johnson@example.com',
    '+1-555-0101',
    'https://drsarahjohnson.com',
    true,
    'PUBLIC',
    'dr-sarah-johnson',
    ARRAY['anxiety', 'depression', 'therapy', 'psychology'],
    'Experienced therapist specializing in anxiety and depression',
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'ther2222-2222-2222-2222-222222222222'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Licensed Marriage Counselor',
    'Expert in couples therapy and relationship counseling.',
    'Ekspert w terapii par i doradztwie małżeńskim.',
    'MA in Marriage and Family Therapy, 8 years of practice',
    'Magister terapii małżeńskiej i rodzinnej, 8 lat praktyki',
    ARRAY['English'],
    true,
    false,
    'michael.brown@example.com',
    '+1-555-0102',
    'https://coupleshelp.com',
    true,
    'PUBLIC',
    'dr-michael-brown',
    ARRAY['couples', 'marriage', 'relationships', 'counseling'],
    'Specialized couples and marriage therapist',
    true,
    NOW(),
    NOW(),
    NOW()
),
(
    'ther3333-3333-3333-3333-333333333333'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    '22222222-2222-2222-2222-222222222222'::uuid,
    'Trauma Specialist',
    'Helping individuals recover from trauma using EMDR and CBT techniques.',
    'Pomagam osobom w powrocie do zdrowia po traumie używając technik EMDR i CBT.',
    'PhD in Clinical Psychology, specialized in trauma therapy',
    'Doktor psychologii klinicznej, specjalizacja w terapii traumy',
    ARRAY['Polish', 'English', 'German'],
    false,
    true,
    'anna.kowalski@example.com',
    '+48-555-0103',
    'https://traumahelp.pl',
    false,
    'ORGANISATION_ONLY',
    'dr-anna-kowalski',
    ARRAY['trauma', 'EMDR', 'CBT', 'PTSD'],
    'Trauma therapy specialist with EMDR certification',
    true,
    NULL,
    NOW(),
    NOW()
);

-- Link therapists to specializations
INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary) VALUES
('ther1111-1111-1111-1111-111111111111'::uuid, 'spec1111-1111-1111-1111-111111111111'::uuid, true),
('ther1111-1111-1111-1111-111111111111'::uuid, 'spec2222-2222-2222-2222-222222222222'::uuid, false),
('ther2222-2222-2222-2222-222222222222'::uuid, 'spec3333-3333-3333-3333-333333333333'::uuid, true),
('ther3333-3333-3333-3333-333333333333'::uuid, 'spec4444-4444-4444-4444-444444444444'::uuid, true);

-- Display created test data for verification
SELECT 'Test Organizations:' as info;
SELECT id, name, description FROM organisation WHERE name LIKE '%Test%' OR name = 'Admin Org';

SELECT 'Test Users:' as info;
SELECT id, username, email, full_name FROM "user" WHERE username IN ('testuser', 'testuser2', 'admin', 'therapist1', 'therapist2', 'therapist3');

SELECT 'Organisation Memberships:' as info;
SELECT 
    u.username,
    o.name as organisation_name,
    om.member_type,
    om.joined_at
FROM organisation_member om
JOIN "user" u ON om.user_id = u.id
JOIN organisation o ON om.organisation_id = o.id
WHERE u.username IN ('testuser', 'testuser2', 'admin', 'therapist1', 'therapist2', 'therapist3')
ORDER BY u.username, o.name;

SELECT 'Sample Therapists:' as info;
SELECT 
    t.professional_title,
    u.full_name as therapist_name,
    o.name as organisation_name,
    t.visibility,
    CASE WHEN t.published_at IS NOT NULL THEN 'Published' ELSE 'Draft' END as status,
    t.is_accepting_new_clients
FROM therapist t
JOIN "user" u ON t.user_id = u.id
JOIN organisation o ON t.organisation_id = o.id
ORDER BY t.created_at;