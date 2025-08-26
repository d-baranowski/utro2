-- Script to add sample therapist data for testing
-- This assumes the main test data (users, organizations) is already loaded

-- First, let's check what specialization IDs we can use
DO $$
DECLARE
    anxiety_spec_id UUID;
    depression_spec_id UUID;
    couples_spec_id UUID;
    trauma_spec_id UUID;
BEGIN
    -- Get existing specialization IDs
    SELECT id INTO anxiety_spec_id FROM specialization WHERE name_eng = 'Anxiety Disorders' LIMIT 1;
    SELECT id INTO depression_spec_id FROM specialization WHERE name_eng = 'Depression' LIMIT 1;
    SELECT id INTO couples_spec_id FROM specialization WHERE name_eng = 'Couples Therapy' LIMIT 1;
    SELECT id INTO trauma_spec_id FROM specialization WHERE name_eng = 'Trauma & PTSD' LIMIT 1;

    -- Clean up existing therapist data first
    DELETE FROM therapist_specialization WHERE therapist_id IN (
        SELECT id FROM therapist WHERE user_id IN (
            SELECT id FROM "user" WHERE username LIKE 'therapist%'
        )
    );
    DELETE FROM therapist_languages WHERE therapist_id IN (
        SELECT id FROM therapist WHERE user_id IN (
            SELECT id FROM "user" WHERE username LIKE 'therapist%'
        )
    );
    DELETE FROM therapist_search_tags WHERE therapist_id IN (
        SELECT id FROM therapist WHERE user_id IN (
            SELECT id FROM "user" WHERE username LIKE 'therapist%'
        )
    );
    DELETE FROM therapist WHERE user_id IN (
        SELECT id FROM "user" WHERE username LIKE 'therapist%'
    );
    DELETE FROM organisation_member WHERE user_id IN (
        SELECT id FROM "user" WHERE username LIKE 'therapist%'
    );
    DELETE FROM "user" WHERE username LIKE 'therapist%';

    -- Create therapist users
    INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
    ('11aa11aa-11aa-11aa-11aa-11aa11aa11aa'::uuid, 'therapist1', 'therapist1@example.com', 'Dr. Sarah Johnson', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
    ('22bb22bb-22bb-22bb-22bb-22bb22bb22bb'::uuid, 'therapist2', 'therapist2@example.com', 'Dr. Michael Brown', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW()),
    ('33cc33cc-33cc-33cc-33cc-33cc33cc33cc'::uuid, 'therapist3', 'therapist3@example.com', 'Dr. Anna Kowalski', 'local', '$2b$12$9RRcvqzfvTx9zVacbjdNYuSzrCHOg8ITf5DhLmbGRZ8CwSwly8Pc.', NOW(), NOW());

    -- Add therapist users to organizations
    INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
    ('11aa11aa-11aa-11aa-11aa-11aa11aa11aa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MEMBER', NOW()),
    ('22bb22bb-22bb-22bb-22bb-22bb22bb22bb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'MEMBER', NOW()),
    ('33cc33cc-33cc-33cc-33cc-33cc33cc33cc'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'MEMBER', NOW());

    -- Create therapist profiles
    INSERT INTO therapist (
        id, user_id, organisation_id, professional_title, description_eng, description_pl,
        work_experience_eng, work_experience_pl, in_person_therapy_format,
        online_therapy_format, contact_email, contact_phone, website_url,
        is_accepting_new_clients, visibility, slug, meta_description,
        is_active, published_at, created_at, updated_at
    ) VALUES
    (
        'aaaaaaaa-1111-1111-1111-111111111111'::uuid,
        '11aa11aa-11aa-11aa-11aa-11aa11aa11aa'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Clinical Psychologist',
        'Specializing in anxiety and depression treatment with over 10 years of experience. I use evidence-based approaches including CBT and mindfulness techniques.',
        'Specjalizuję się w leczeniu lęku i depresji z ponad 10-letnim doświadczeniem. Używam podejść opartych na dowodach, w tym CBT i technik uważności.',
        'PhD in Clinical Psychology from University of Warsaw, 10+ years treating anxiety disorders in private practice',
        'Doktor psychologii klinicznej z Uniwersytetu Warszawskiego, 10+ lat leczenia zaburzeń lękowych w praktyce prywatnej',
        true,
        true,
        'sarah.johnson@example.com',
        '+1-555-0101',
        'https://drsarahjohnson.com',
        true,
        'PUBLIC',
        'dr-sarah-johnson',
        'Experienced therapist specializing in anxiety and depression treatment',
        true,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'bbbbbbbb-2222-2222-2222-222222222222'::uuid,
        '22bb22bb-22bb-22bb-22bb-22bb22bb22bb'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Licensed Marriage Counselor',
        'Expert in couples therapy and relationship counseling. I help couples rebuild communication and strengthen their bonds.',
        'Ekspert w terapii par i doradztwie małżeńskim. Pomagam parom odbudować komunikację i wzmocnić ich więzi.',
        'MA in Marriage and Family Therapy from Jagiellonian University, 8 years of practice specializing in couples therapy',
        'Magister terapii małżeńskiej i rodzinnej z Uniwersytetu Jagiellońskiego, 8 lat praktyki specjalizującej się w terapii par',
        true,
        false,
        'michael.brown@example.com',
        '+1-555-0102',
        'https://coupleshelp.com',
        true,
        'PUBLIC',
        'dr-michael-brown',
        'Specialized couples and marriage therapist',
        true,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'cccccccc-3333-3333-3333-333333333333'::uuid,
        '33cc33cc-33cc-33cc-33cc-33cc33cc33cc'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Trauma Specialist',
        'Helping individuals recover from trauma using EMDR and CBT techniques. I specialize in PTSD treatment and complex trauma.',
        'Pomagam osobom w powrocie do zdrowia po traumie używając technik EMDR i CBT. Specjalizuję się w leczeniu PTSD i złożonej traumy.',
        'PhD in Clinical Psychology from Medical University of Warsaw, specialized training in trauma therapy and EMDR certification',
        'Doktor psychologii klinicznej z Warszawskiego Uniwersytetu Medycznego, specjalistyczne szkolenie w terapii traumy i certyfikacja EMDR',
        false,
        true,
        'anna.kowalski@example.com',
        '+48-555-0103',
        'https://traumahelp.pl',
        false,
        'ORGANISATION_ONLY',
        'dr-anna-kowalski',
        'Trauma therapy specialist with EMDR certification',
        true,
        NULL, -- unpublished
        NOW(),
        NOW()
    );

    -- Add languages for therapists
    INSERT INTO therapist_languages (therapist_id, language) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'English'),
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'Polish'),
    ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'English'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'Polish'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'English'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'German');

    -- Add search tags for therapists
    INSERT INTO therapist_search_tags (therapist_id, tag) VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'anxiety'),
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'depression'),
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'therapy'),
    ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, 'psychology'),
    ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'couples'),
    ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'marriage'),
    ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'relationships'),
    ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, 'counseling'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'trauma'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'EMDR'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'CBT'),
    ('cccccccc-3333-3333-3333-333333333333'::uuid, 'PTSD');

    -- Link therapists to specializations (only if specializations exist)
    IF anxiety_spec_id IS NOT NULL THEN
        INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary) VALUES
        ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, anxiety_spec_id, true);
    END IF;
    
    IF depression_spec_id IS NOT NULL THEN
        INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary) VALUES
        ('aaaaaaaa-1111-1111-1111-111111111111'::uuid, depression_spec_id, false);
    END IF;
    
    IF couples_spec_id IS NOT NULL THEN
        INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary) VALUES
        ('bbbbbbbb-2222-2222-2222-222222222222'::uuid, couples_spec_id, true);
    END IF;
    
    IF trauma_spec_id IS NOT NULL THEN
        INSERT INTO therapist_specialization (therapist_id, specialization_id, is_primary) VALUES
        ('cccccccc-3333-3333-3333-333333333333'::uuid, trauma_spec_id, true);
    END IF;

END $$;

-- Display the created therapist data
SELECT 'Sample Therapists Created:' as info;
SELECT 
    t.professional_title,
    u.full_name as therapist_name,
    o.name as organisation_name,
    t.visibility,
    CASE WHEN t.published_at IS NOT NULL THEN 'Published' ELSE 'Draft' END as status,
    t.is_accepting_new_clients,
    array_agg(DISTINCT tl.language ORDER BY tl.language) as languages,
    array_agg(DISTINCT ts.name_eng ORDER BY ts.name_eng) as specializations
FROM therapist t
JOIN "user" u ON t.user_id = u.id
JOIN organisation o ON t.organisation_id = o.id
LEFT JOIN therapist_languages tl ON t.id = tl.therapist_id
LEFT JOIN therapist_specialization tspec ON t.id = tspec.therapist_id
LEFT JOIN specialization ts ON tspec.specialization_id = ts.id
WHERE u.username LIKE 'therapist%'
GROUP BY t.id, t.professional_title, u.full_name, o.name, t.visibility, t.published_at, t.is_accepting_new_clients
ORDER BY t.created_at;