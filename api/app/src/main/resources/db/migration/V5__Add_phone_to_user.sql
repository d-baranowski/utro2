-- Add phone number and verification columns to user table
ALTER TABLE "user" ADD COLUMN phone VARCHAR(50);
ALTER TABLE "user" ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN phone_verified BOOLEAN DEFAULT false;