-- Therapist test data setup for Cypress tests
-- This script creates therapist test data needed for E2E tests

-- Clean up any existing therapist test data
DELETE FROM therapist_specialization WHERE therapist_id IN (
    SELECT id FROM therapist WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid
);
DELETE FROM therapist_education WHERE therapist_id IN (
    SELECT id FROM therapist WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid
);
DELETE FROM therapist_certification WHERE therapist_id IN (
    SELECT id FROM therapist WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid
);
DELETE FROM therapist WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid;

-- Clean up test users and organization
DELETE FROM organisation_member WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid;
DELETE FROM organisation WHERE id = '44444444-4444-4444-4444-444444444444'::uuid;
DELETE FROM "user" WHERE id IN (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

-- Create test organization
INSERT INTO organisation (id, name, description, created_at, updated_at) VALUES
('44444444-4444-4444-4444-444444444444'::uuid, 'Therapist Test Org', 'Organization for therapist testing', NOW(), NOW());

-- Create test users
-- therapist_admin: testpass
-- regular_user: testpass
-- therapist_user: testpass
INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'therapist_admin', 'therapist_admin@test.com', 'Therapist Admin', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'regular_user', 'regular_user@test.com', 'Regular User', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'therapist_user', 'therapist_user@test.com', 'Therapist User', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW());

-- Create organisation memberships
INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
-- therapist_admin is admin
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'ADMINISTRATOR', NOW()),
-- regular_user is member
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'MEMBER', NOW()),
-- therapist_user is member
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'MEMBER', NOW());

-- Insert test specializations (using existing ones or create new test ones)
INSERT INTO specialization (id, name_eng, name_pl, category, description_eng, description_pl, is_active) VALUES
('spec1111-1111-1111-1111-111111111111'::uuid, 'Test Anxiety Disorders', 'Test Zaburzenia lękowe', 'Mental Health', 'Test treatment of anxiety disorders', 'Test leczenie zaburzeń lękowych', true),
('spec2222-2222-2222-2222-222222222222'::uuid, 'Test Depression', 'Test Depresja', 'Mental Health', 'Test treatment of depression', 'Test leczenie depresji', true),
('spec3333-3333-3333-3333-333333333333'::uuid, 'Test Couples Therapy', 'Test Terapia par', 'Relationships', 'Test couples counseling', 'Test poradnictwo par', true)
ON CONFLICT (id) DO NOTHING;

-- Create test therapists
INSERT INTO therapist (
    id, user_id, organisation_id, professional_title, 
    description_eng, description_pl, work_experience_eng, work_experience_pl,
    languages, in_person_therapy_format, online_therapy_format,
    contact_email, contact_phone, website_url, 
    is_active, is_accepting_new_clients, visibility,
    slug, meta_description, search_tags, 
    published_at, created_at, updated_at
) VALUES
-- Published therapist (therapist_user)
('77777777-7777-7777-7777-777777777777'::uuid, 
 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 
 '44444444-4444-4444-4444-444444444444'::uuid, 
 'Licensed Clinical Psychologist',
 'I specialize in helping individuals overcome anxiety and depression using evidence-based therapeutic approaches.',
 'Specjalizuję się w pomaganiu jednostkom w przezwyciężaniu lęku i depresji, wykorzystując oparte na dowodach podejścia terapeutyczne.',
 '10+ years of experience in clinical psychology with specialization in CBT and trauma therapy.',
 'Ponad 10 lat doświadczenia w psychologii klinicznej ze specjalizacją w CBT i terapii traumy.',
 ARRAY['English', 'Polish', 'German'], 
 true, true,
 'therapist@test.com', '+48 123 456 789', 'https://example-therapist.com',
 true, true, 'PUBLIC',
 'dr-test-therapist', 'Licensed psychologist specializing in anxiety and depression treatment.',
 ARRAY['anxiety', 'depression', 'CBT', 'trauma'],
 '2024-01-01T10:00:00Z'::timestamp with time zone, NOW(), NOW()),

-- Unpublished therapist (regular_user)
('88888888-8888-8888-8888-888888888888'::uuid,
 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
 '44444444-4444-4444-4444-444444444444'::uuid,
 'Clinical Social Worker',
 'Providing support for family and relationship counseling.',
 'Zapewnianie wsparcia w poradnictwie rodzinnym i związkowym.',
 '5 years experience in family therapy.',
 '5 lat doświadczenia w terapii rodzinnej.',
 ARRAY['English', 'Polish'],
 true, false,
 'unpublished@test.com', '+48 987 654 321', '',
 true, false, 'PRIVATE',
 'unpublished-therapist', 'Family and relationship counselor.',
 ARRAY['family', 'relationships'],
 NULL, NOW(), NOW());

-- Create therapist specializations
INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary, years_of_practice) VALUES
-- Published therapist specializations
('77777777-7777-7777-7777-777777777777'::uuid, 'spec1111-1111-1111-1111-111111111111'::uuid, true, 10),
('77777777-7777-7777-7777-777777777777'::uuid, 'spec2222-2222-2222-2222-222222222222'::uuid, false, 8),
-- Unpublished therapist specializations
('88888888-8888-8888-8888-888888888888'::uuid, 'spec3333-3333-3333-3333-333333333333'::uuid, true, 5);

-- Create sample education records
INSERT INTO therapist_education (
    id, therapist_id, degree, field_of_study, institution, country,
    start_year, graduation_year, is_completed, display_order
) VALUES
('edu11111-1111-1111-1111-111111111111'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 
 'Ph.D.', 'Clinical Psychology', 'University of Warsaw', 'Poland', 
 2010, 2014, true, 1),
('edu22222-2222-2222-2222-222222222222'::uuid, '88888888-8888-8888-8888-888888888888'::uuid,
 'M.S.W.', 'Social Work', 'Jagiellonian University', 'Poland',
 2017, 2019, true, 1);

-- Create sample certification records
INSERT INTO therapist_certification (
    id, therapist_id, certification_name, issuing_organization, country,
    issue_date, expiry_date, is_active, display_order
) VALUES
('cert1111-1111-1111-1111-111111111111'::uuid, '77777777-7777-7777-7777-777777777777'::uuid,
 'Certified CBT Therapist', 'Polish Psychological Association', 'Poland',
 '2015-06-01'::date, '2025-06-01'::date, true, 1),
('cert2222-2222-2222-2222-222222222222'::uuid, '88888888-8888-8888-8888-888888888888'::uuid,
 'Family Therapy Certification', 'International Family Therapy Association', 'Poland',
 '2020-03-15'::date, '2025-03-15'::date, true, 1);

-- Display created test data for verification
SELECT 'Test Therapist Organization:' as info;
SELECT id, name, description FROM organisation WHERE id = '44444444-4444-4444-4444-444444444444'::uuid;

SELECT 'Test Therapist Users:' as info;
SELECT id, username, email, full_name FROM "user" WHERE id IN (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

SELECT 'Test Therapists:' as info;
SELECT 
    t.id, 
    t.professional_title, 
    u.username,
    t.visibility,
    CASE WHEN t.published_at IS NULL THEN 'Unpublished' ELSE 'Published' END as status
FROM therapist t
JOIN "user" u ON t.user_id = u.id
WHERE t.organisation_id = '44444444-4444-4444-4444-444444444444'::uuid
ORDER BY t.professional_title;

SELECT 'Test Specializations:' as info;
SELECT ts.therapist_id, s.name_eng, ts.is_primary, ts.years_of_practice
FROM therapist_specialization ts
JOIN specialization s ON ts.specialization_id = s.id
WHERE ts.therapist_id IN (
    '77777777-7777-7777-7777-777777777777'::uuid,
    '88888888-8888-8888-8888-888888888888'::uuid
)
ORDER BY ts.therapist_id, ts.is_primary DESC;