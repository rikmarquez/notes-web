-- Privacy Migration - Add is_private field to notes table
-- Date: 2025-01-10
-- Description: Adds privacy support to notes, allowing users to mark notes as private

-- Add is_private column to notes table
-- Default to false to maintain current public behavior for existing notes
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Add index for efficient filtering by privacy status
CREATE INDEX IF NOT EXISTS idx_notes_is_private ON notes(is_private);

-- Create composite index for user_id + is_private for optimal query performance
CREATE INDEX IF NOT EXISTS idx_notes_user_private ON notes(user_id, is_private);

-- Update existing notes to be public (this is redundant due to DEFAULT false, but explicit for clarity)
UPDATE notes SET is_private = false WHERE is_private IS NULL;