-- Migration: rename_photo_cols
-- Created: 2026-08-04T16:15:00.510Z

-- Add your migration SQL here

BEGIN;

DO $$
BEGIN
    -- Rename image_endpoint → image_src if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'photos'
          AND column_name = 'image_endpoint'
    ) THEN
        ALTER TABLE photos
            RENAME COLUMN image_endpoint TO image_src;
    END IF;

    -- Rename placeholder_endpoint → placeholder_src if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'photos'
          AND column_name = 'placeholder_endpoint'
    ) THEN
        ALTER TABLE photos
            RENAME COLUMN placeholder_endpoint TO placeholder_src;
    END IF;
END $$;

COMMIT;
