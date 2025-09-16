-- Create offer table
CREATE TABLE IF NOT EXISTS offer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_eng TEXT,
    name_pl TEXT,
    description_eng TEXT,
    description_pl TEXT,
    organisation_id UUID NOT NULL,
    profile_image BYTEA,
    profile_image_mime_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_offer_organisation FOREIGN KEY (organisation_id) REFERENCES organisation(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_offer_organisation ON offer(organisation_id);
CREATE INDEX idx_offer_created_at ON offer(created_at);
CREATE INDEX idx_offer_updated_at ON offer(updated_at);

-- Full text search indexes for multilingual search
CREATE INDEX idx_offer_fulltext_eng ON offer USING GIN(
    to_tsvector('english', 
        COALESCE(name_eng, '') || ' ' || 
        COALESCE(description_eng, '')
    )
);

CREATE INDEX idx_offer_fulltext_pl ON offer USING GIN(
    to_tsvector('simple', 
        COALESCE(name_pl, '') || ' ' || 
        COALESCE(description_pl, '')
    )
);

-- Trigger to auto-update updated_at timestamp (reusing existing function)
CREATE TRIGGER offer_updated_at_trigger
    BEFORE UPDATE ON offer
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE offer IS 'Organizations services and offers table';
COMMENT ON COLUMN offer.id IS 'Unique identifier for the offer';
COMMENT ON COLUMN offer.name_eng IS 'Offer name in English';
COMMENT ON COLUMN offer.name_pl IS 'Offer name in Polish';
COMMENT ON COLUMN offer.description_eng IS 'Offer description in English';
COMMENT ON COLUMN offer.description_pl IS 'Offer description in Polish';
COMMENT ON COLUMN offer.organisation_id IS 'Reference to the organization that owns this offer';
COMMENT ON COLUMN offer.profile_image IS 'Offer image as binary data';
COMMENT ON COLUMN offer.profile_image_mime_type IS 'MIME type of the profile image';
COMMENT ON COLUMN offer.created_at IS 'Timestamp when the offer was created';
COMMENT ON COLUMN offer.updated_at IS 'Timestamp when the offer was last updated';