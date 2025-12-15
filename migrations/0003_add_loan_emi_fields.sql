-- Add new fields to loans table for EMI calculations
ALTER TABLE loans ADD COLUMN IF NOT EXISTS tenure INTEGER;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'reducing';
ALTER TABLE loans ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'monthly';
ALTER TABLE loans ADD COLUMN IF NOT EXISTS emi_amount DOUBLE PRECISION;

-- Update existing loans with default values
UPDATE loans SET tenure = 12 WHERE tenure IS NULL;
UPDATE loans SET start_date = CURRENT_DATE WHERE start_date IS NULL;
UPDATE loans SET calculation_method = 'reducing' WHERE calculation_method IS NULL;
UPDATE loans SET payment_frequency = 'monthly' WHERE payment_frequency IS NULL;

-- Make tenure and start_date NOT NULL after setting defaults
ALTER TABLE loans ALTER COLUMN tenure SET NOT NULL;
ALTER TABLE loans ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE loans ALTER COLUMN calculation_method SET NOT NULL;
ALTER TABLE loans ALTER COLUMN payment_frequency SET NOT NULL;
