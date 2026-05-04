-- Migration: Add role column to students table
-- Date: March 11, 2026
-- Purpose: Enable role-based access control (RBAC)

USE peer_learning;

-- Check if column exists before adding
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'ROLE_STUDENT';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_role ON students(role);

-- Verify the change
DESCRIBE students;

-- Optional: Set admin role for admin user if exists
UPDATE students 
SET role = 'ROLE_ADMIN' 
WHERE email = 'admin.peertopeer@gmail.com';

-- Show all students with their roles
SELECT id, full_name, roll_number, email, role, registration_date 
FROM students 
ORDER BY registration_date DESC;

-- Success message
SELECT 'Database migration completed successfully!' AS Status;
