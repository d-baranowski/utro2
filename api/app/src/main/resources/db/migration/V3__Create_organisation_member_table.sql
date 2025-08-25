CREATE TABLE organisation_member (
    user_id UUID NOT NULL,
    organisation_id UUID NOT NULL,
    member_type VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, organisation_id),
    CONSTRAINT fk_organisation_member_user FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
    CONSTRAINT fk_organisation_member_organisation FOREIGN KEY (organisation_id) REFERENCES organisation(id) ON DELETE CASCADE,
    CONSTRAINT chk_member_type CHECK (member_type IN ('ADMINISTRATOR', 'MEMBER'))
);

CREATE INDEX idx_organisation_member_organisation ON organisation_member(organisation_id);
CREATE INDEX idx_organisation_member_user ON organisation_member(user_id);
CREATE INDEX idx_organisation_member_type ON organisation_member(member_type);

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS fk_user_organisation;
ALTER TABLE "user" DROP COLUMN IF EXISTS organisation_id;
DROP INDEX IF EXISTS idx_user_organisation;