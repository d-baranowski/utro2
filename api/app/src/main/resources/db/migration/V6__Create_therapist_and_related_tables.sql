-- Create main therapist table
CREATE TABLE therapist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    organisation_id UUID NOT NULL,
    
    -- Basic Information
    professional_title VARCHAR(255),
    
    -- Descriptions (Markdown supported, multilingual)
    description_eng TEXT,
    description_pl TEXT,
    work_experience_eng TEXT, -- CV-like work experience in markdown
    work_experience_pl TEXT,  -- CV-like work experience in markdown
    
    -- Languages spoken
    languages TEXT[], -- e.g., ['Polish', 'English', 'German']
    
    -- Consultation formats
    in_person_therapy_format BOOLEAN DEFAULT false,
    online_therapy_format BOOLEAN DEFAULT false,
    
    -- Profile Image
    profile_image BYTEA, -- Main profile photo as blob
    profile_image_mime_type VARCHAR(50), -- e.g., 'image/jpeg', 'image/png'
    
    -- Contact Information
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url VARCHAR(500),
    
    -- Status and Visibility
    is_active BOOLEAN DEFAULT true,
    is_accepting_new_clients BOOLEAN DEFAULT true,
    visibility VARCHAR(20) DEFAULT 'PUBLIC', -- PUBLIC, ORGANISATION_ONLY, PRIVATE
    
    -- SEO and Search
    slug VARCHAR(255) UNIQUE, -- URL-friendly identifier
    meta_description TEXT, -- For SEO
    search_tags TEXT[], -- Additional tags for search
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_therapist_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_therapist_organisation FOREIGN KEY (organisation_id) REFERENCES organisation(id) ON DELETE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_visibility CHECK (visibility IN ('PUBLIC', 'ORGANISATION_ONLY', 'PRIVATE'))
);

-- Create specialization lookup table
CREATE TABLE specialization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_eng VARCHAR(255) NOT NULL,
    name_pl VARCHAR(255) NOT NULL,
    description_eng TEXT,
    description_pl TEXT,
    category VARCHAR(100), -- e.g., 'Mental Health', 'Relationships', 'Children'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name_eng),
    UNIQUE(name_pl)
);

-- Create therapist-specialization link table
CREATE TABLE therapist_specialization (
    therapist_id UUID NOT NULL,
    specialization_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT false, -- Mark primary specializations
    years_of_practice INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (therapist_id, specialization_id),
    CONSTRAINT fk_therapist_spec_therapist FOREIGN KEY (therapist_id) REFERENCES therapist(id) ON DELETE CASCADE,
    CONSTRAINT fk_therapist_spec_specialization FOREIGN KEY (specialization_id) REFERENCES specialization(id) ON DELETE CASCADE
);

-- Create education table
CREATE TABLE therapist_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL,
    degree VARCHAR(255) NOT NULL, -- e.g., 'M.A.', 'Ph.D.', 'B.Sc.'
    field_of_study VARCHAR(255),
    institution VARCHAR(500) NOT NULL,
    country VARCHAR(100),
    start_year INTEGER,
    graduation_year INTEGER,
    is_completed BOOLEAN DEFAULT true,
    thesis_title TEXT,
    honors TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_education_therapist FOREIGN KEY (therapist_id) REFERENCES therapist(id) ON DELETE CASCADE,
    CONSTRAINT chk_education_years CHECK (start_year IS NULL OR start_year >= 1900),
    CONSTRAINT chk_graduation_year CHECK (graduation_year IS NULL OR graduation_year >= 1900)
);

-- Create certification table
CREATE TABLE therapist_certification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    therapist_id UUID NOT NULL,
    name VARCHAR(500) NOT NULL,
    issuing_organization VARCHAR(500) NOT NULL,
    credential_id VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    verification_url VARCHAR(500),
    certification_level VARCHAR(100), -- e.g., 'Basic', 'Advanced', 'Expert'
    hours_completed INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_certification_therapist FOREIGN KEY (therapist_id) REFERENCES therapist(id) ON DELETE CASCADE,
    CONSTRAINT chk_cert_dates CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- Create indexes for performance
CREATE INDEX idx_therapist_user ON therapist(user_id);
CREATE INDEX idx_therapist_organisation ON therapist(organisation_id);
CREATE INDEX idx_therapist_slug ON therapist(slug);
CREATE INDEX idx_therapist_active ON therapist(is_active);
CREATE INDEX idx_therapist_accepting ON therapist(is_accepting_new_clients);
CREATE INDEX idx_therapist_visibility ON therapist(visibility);
CREATE INDEX idx_therapist_languages ON therapist USING GIN(languages);
CREATE INDEX idx_therapist_search_tags ON therapist USING GIN(search_tags);

CREATE INDEX idx_specialization_category ON specialization(category);
CREATE INDEX idx_specialization_active ON specialization(is_active);

CREATE INDEX idx_therapist_spec_therapist ON therapist_specialization(therapist_id);
CREATE INDEX idx_therapist_spec_specialization ON therapist_specialization(specialization_id);
CREATE INDEX idx_therapist_spec_primary ON therapist_specialization(is_primary);

CREATE INDEX idx_education_therapist ON therapist_education(therapist_id);
CREATE INDEX idx_education_order ON therapist_education(therapist_id, display_order);

CREATE INDEX idx_certification_therapist ON therapist_certification(therapist_id);
CREATE INDEX idx_certification_active ON therapist_certification(is_active);
CREATE INDEX idx_certification_expiry ON therapist_certification(expiry_date);
CREATE INDEX idx_certification_order ON therapist_certification(therapist_id, display_order);

-- Full text search indexes
CREATE INDEX idx_therapist_fulltext_eng ON therapist USING GIN(
    to_tsvector('english', 
        COALESCE(description_eng, '') || ' ' || 
        COALESCE(work_experience_eng, '') || ' ' ||
        COALESCE(professional_title, '')
    )
);

CREATE INDEX idx_therapist_fulltext_pl ON therapist USING GIN(
    to_tsvector('simple', 
        COALESCE(description_pl, '') || ' ' || 
        COALESCE(work_experience_pl, '') || ' ' ||
        COALESCE(professional_title, '')
    )
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER therapist_updated_at_trigger
    BEFORE UPDATE ON therapist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER specialization_updated_at_trigger
    BEFORE UPDATE ON specialization
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER education_updated_at_trigger
    BEFORE UPDATE ON therapist_education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER certification_updated_at_trigger
    BEFORE UPDATE ON therapist_certification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some common specializations
INSERT INTO specialization (name_eng, name_pl, category, description_eng, description_pl) VALUES
('Anxiety Disorders', 'Zaburzenia lękowe', 'Mental Health', 'Treatment of various anxiety disorders including GAD, panic disorder, and phobias', 'Leczenie różnych zaburzeń lękowych, w tym GAD, zaburzeń panicznych i fobii'),
('Depression', 'Depresja', 'Mental Health', 'Treatment of major depressive disorder and related mood disorders', 'Leczenie dużej depresji i powiązanych zaburzeń nastroju'),
('Couples Therapy', 'Terapia par', 'Relationships', 'Counseling for couples to improve communication and resolve conflicts', 'Poradnictwo dla par w celu poprawy komunikacji i rozwiązywania konfliktów'),
('Child Psychology', 'Psychologia dziecięca', 'Children', 'Specialized therapy for children and adolescents', 'Specjalistyczna terapia dla dzieci i młodzieży'),
('Trauma & PTSD', 'Trauma i PTSD', 'Mental Health', 'Treatment of post-traumatic stress disorder and trauma-related conditions', 'Leczenie zespołu stresu pourazowego i stanów związanych z traumą'),
('Cognitive Behavioral Therapy', 'Terapia poznawczo-behawioralna', 'Methods', 'CBT approach to treating various mental health conditions', 'Podejście CBT do leczenia różnych stanów zdrowia psychicznego'),
('Family Therapy', 'Terapia rodzinna', 'Relationships', 'Therapy involving multiple family members to improve dynamics', 'Terapia z udziałem wielu członków rodziny w celu poprawy dynamiki'),
('Addiction Therapy', 'Terapia uzależnień', 'Mental Health', 'Treatment for substance abuse and behavioral addictions', 'Leczenie nadużywania substancji i uzależnień behawioralnych');