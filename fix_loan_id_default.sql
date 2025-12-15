-- Fix the id column default for loans table
ALTER TABLE loans ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the change
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name = 'id';
