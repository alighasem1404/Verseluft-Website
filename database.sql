-- Drop the existing table if it exists
DROP TABLE IF EXISTS users;

-- Create the users table with all required columns
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 