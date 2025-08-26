-- Cleanup therapist test data
-- This script removes all therapist test data created for Cypress tests

-- Clean up therapist-related test data
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

-- Clean up test specializations (only the test ones we created)
DELETE FROM specialization WHERE id IN (
    'spec1111-1111-1111-1111-111111111111'::uuid,
    'spec2222-2222-2222-2222-222222222222'::uuid,
    'spec3333-3333-3333-3333-333333333333'::uuid
);

-- Clean up organisation memberships
DELETE FROM organisation_member WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid;

-- Clean up test organisation
DELETE FROM organisation WHERE id = '44444444-4444-4444-4444-444444444444'::uuid;

-- Clean up test users
DELETE FROM "user" WHERE id IN (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
);

-- Verify cleanup
SELECT 'Remaining test data (should be empty):' as info;

SELECT 'Test Users:' as category, COUNT(*) as count FROM "user" 
WHERE id IN (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid
)
UNION ALL
SELECT 'Test Organisation:', COUNT(*) FROM organisation 
WHERE id = '44444444-4444-4444-4444-444444444444'::uuid
UNION ALL
SELECT 'Test Therapists:', COUNT(*) FROM therapist 
WHERE organisation_id = '44444444-4444-4444-4444-444444444444'::uuid
UNION ALL
SELECT 'Test Specializations:', COUNT(*) FROM specialization 
WHERE id IN (
    'spec1111-1111-1111-1111-111111111111'::uuid,
    'spec2222-2222-2222-2222-222222222222'::uuid,
    'spec3333-3333-3333-3333-333333333333'::uuid
);