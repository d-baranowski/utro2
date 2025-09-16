-- Create the invitation table
CREATE TABLE IF NOT EXISTS invitation (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organisation_id UUID NOT NULL,
    invited_by UUID,
    member_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (organisation_id) REFERENCES organisation(id),
    FOREIGN KEY (invited_by) REFERENCES "user"(id)
);

-- Add an index for faster lookups by email and status
CREATE INDEX idx_invitation_email_status ON invitation(email, status);

-- Add an index for organization lookups
CREATE INDEX idx_invitation_organisation_id ON invitation(organisation_id);
