-- Add password field to user table for authentication
-- This migration adds a password column to support basic username/password authentication

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create index for password queries (though we shouldn't query passwords directly in production)
-- This is mainly for development/testing purposes
CREATE INDEX IF NOT EXISTS idx_user_password ON "user"(password) WHERE password IS NOT NULL;