-- Fix therapist schema to match JPA @ElementCollection mappings
-- This migration converts PostgreSQL arrays to separate tables as expected by Hibernate

-- First, create the therapist_languages table
CREATE TABLE therapist_languages (
    therapist_id UUID NOT NULL,
    language VARCHAR(255) NOT NULL,
    PRIMARY KEY (therapist_id, language),
    CONSTRAINT fk_therapist_languages_therapist FOREIGN KEY (therapist_id) REFERENCES therapist(id) ON DELETE CASCADE
);

-- Create the therapist_search_tags table  
CREATE TABLE therapist_search_tags (
    therapist_id UUID NOT NULL,
    tag VARCHAR(255) NOT NULL,
    PRIMARY KEY (therapist_id, tag),
    CONSTRAINT fk_therapist_search_tags_therapist FOREIGN KEY (therapist_id) REFERENCES therapist(id) ON DELETE CASCADE
);

-- Migrate existing data from arrays to tables (if any exists)
-- Note: This is safe to run even if therapist table is empty
INSERT INTO therapist_languages (therapist_id, language)
SELECT t.id, unnest(t.languages) as language
FROM therapist t
WHERE t.languages IS NOT NULL AND array_length(t.languages, 1) > 0;

INSERT INTO therapist_search_tags (therapist_id, tag) 
SELECT t.id, unnest(t.search_tags) as tag
FROM therapist t
WHERE t.search_tags IS NOT NULL AND array_length(t.search_tags, 1) > 0;

-- Drop the array columns from therapist table
ALTER TABLE therapist DROP COLUMN IF EXISTS languages;
ALTER TABLE therapist DROP COLUMN IF EXISTS search_tags;

-- Create indexes for the new tables
CREATE INDEX idx_therapist_languages_therapist ON therapist_languages(therapist_id);
CREATE INDEX idx_therapist_languages_language ON therapist_languages(language);
CREATE INDEX idx_therapist_search_tags_therapist ON therapist_search_tags(therapist_id);
CREATE INDEX idx_therapist_search_tags_tag ON therapist_search_tags(tag);