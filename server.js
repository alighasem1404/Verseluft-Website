require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use(express.static(path.join(__dirname, '/')));

// File upload configuration
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Add session debugging middleware
app.use((req, res, next) => {
    console.log('Session middleware - Session ID:', req.sessionID);
    console.log('Session middleware - User ID:', req.session.userId);
    console.log('Session middleware - Cookies:', req.headers.cookie);
    next();
});

// Add authentication check middleware
const requireAuth = (req, res, next) => {
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - User ID:', req.session.userId);
    console.log('Auth check - Cookies:', req.headers.cookie);
    
    if (!req.session.userId) {
        console.log('Auth check - No user ID in session');
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

// Passport serialization/deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return done(null, false);
        }
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        const [users] = await db.promise().query('SELECT * FROM users WHERE google_id = ? OR email = ?', 
            [profile.id, profile.emails[0].value]);
        
        if (users.length > 0) {
            // Update Google ID if not set
            if (!users[0].google_id) {
                await db.promise().query('UPDATE users SET google_id = ? WHERE id = ?', 
                    [profile.id, users[0].id]);
            }
            return done(null, users[0]);
        }

        // Create new user
        const [result] = await db.promise().query(
            'INSERT INTO users (name, email, google_id, profile_image) VALUES (?, ?, ?, ?)',
            [profile.displayName, profile.emails[0].value, profile.id, profile.photos[0].value]
        );

        const newUser = {
            id: result.insertId,
            name: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            profile_image: profile.photos[0].value
        };

        return done(null, newUser);
    } catch (err) {
        return done(err, null);
    }
}));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'verseluft-web'
});

// Connect to MySQL and create database/table if they don't exist
db.connect(async (err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');

    try {
        // Create database if it doesn't exist
        await db.promise().query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'verseluft-web'}\``);
        console.log('Database checked/created');

        // Use the database
        await db.promise().query(`USE \`${process.env.DB_NAME || 'verseluft-web'}\``);

        // Create users table with updated schema
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255),
                nickname VARCHAR(255),
                google_id VARCHAR(255) UNIQUE,
                profile_image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table checked/created');

        // Check if nickname column exists, if not add it
        try {
            await db.promise().query(`
                SELECT nickname FROM users LIMIT 1
            `);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                // Add nickname column if it doesn't exist
                await db.promise().query(`
                    ALTER TABLE users
                    ADD COLUMN nickname VARCHAR(255) AFTER password
                `);
                console.log('Nickname column added to users table');
            }
        }
    } catch (error) {
        console.error('Error setting up database:', error);
    }
});

// Logging utility
const logEvent = async (event, details) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${event}: ${JSON.stringify(details)}\n`;
    
    try {
        const logDir = path.join(__dirname, 'logs');
        const logFile = path.join(logDir, 'app.log');
        
        // Create logs directory if it doesn't exist
        try {
            await fs.access(logDir);
        } catch {
            await fs.mkdir(logDir, { recursive: true });
        }
        
        // Append log entry to file
        await fs.appendFile(logFile, logEntry);
        
        // Also log to console
        console.log(logEntry);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
};

// Routes
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        await logEvent('LOGIN_ATTEMPT', { email });
        
        // Check if user exists
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            await logEvent('LOGIN_FAILED', { email, reason: 'Account does not exist' });
            return res.status(401).json({ error: 'The account does not exist. Sign Up instead.' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            await logEvent('LOGIN_FAILED', { email, reason: 'Invalid password' });
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Set session data
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err) {
                logEvent('LOGIN_ERROR', { email, error: 'Session save failed' });
                return res.status(500).json({ error: 'Error establishing session' });
            }
            
            logEvent('LOGIN_SUCCESS', { 
                userId: user.id, 
                email: user.email,
                sessionId: req.sessionID 
            });
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name,
                    nickname: user.nickname,
                    profile_image: user.profile_image 
                } 
            });
        });
    } catch (error) {
        logEvent('LOGIN_ERROR', { email, error: error.message });
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { name, nickname, email, password } = req.body;
    
    await logEvent('SIGNUP_ATTEMPT', { email, name });
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        await logEvent('SIGNUP_FAILED', { email, reason: 'Invalid email format' });
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 4) {
        await logEvent('SIGNUP_FAILED', { email, reason: 'Password too short' });
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            await logEvent('SIGNUP_FAILED', { email, reason: 'Email already registered' });
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.promise().query(
            'INSERT INTO users (name, nickname, email, password) VALUES (?, ?, ?, ?)',
            [name, nickname || null, email, hashedPassword]
        );

        await logEvent('SIGNUP_SUCCESS', { 
            userId: result.insertId, 
            email, 
            name 
        });

        res.json({ success: true, userId: result.insertId });
    } catch (error) {
        await logEvent('SIGNUP_ERROR', { email, error: error.message });
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Google Auth Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            // Set the session
            req.session.userId = req.user.id;
            req.session.save(async (err) => {
                if (err) {
                    await logEvent('GOOGLE_AUTH_ERROR', { 
                        userId: req.user.id, 
                        error: 'Session save failed' 
                    });
                    return res.redirect('/');
                }
                
                await logEvent('GOOGLE_AUTH_SUCCESS', { 
                    userId: req.user.id,
                    email: req.user.email,
                    sessionId: req.sessionID
                });
                
                res.redirect('/');
            });
        } catch (error) {
            await logEvent('GOOGLE_AUTH_ERROR', { error: error.message });
            res.redirect('/');
        }
    }
);

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (!req.session.userId) {
        return res.json({ isAuthenticated: false });
    }

    // Get user data
    db.promise().query('SELECT id, name, email, nickname, profile_image FROM users WHERE id = ?', [req.session.userId])
        .then(([users]) => {
            if (users.length === 0) {
                return res.json({ isAuthenticated: false });
            }
            res.json({ 
                isAuthenticated: true, 
                user: users[0] 
            });
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            res.status(500).json({ error: 'Server error' });
        });
});

// Logout
app.get('/api/logout', async (req, res) => {
    try {
        const userId = req.session.userId;
        await logEvent('LOGOUT', { userId });
        
        req.logout(() => {
            res.json({ success: true });
        });
    } catch (error) {
        await logEvent('LOGOUT_ERROR', { 
            userId: req.session.userId,
            error: error.message 
        });
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Profile routes
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const [users] = await db.promise().query('SELECT id, name, email, nickname, profile_image FROM users WHERE id = ?', [req.session.userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const { name, nickname, email, currentPassword, newPassword, confirmPassword } = req.body;
        
        await logEvent('PROFILE_UPDATE_ATTEMPT', { 
            userId: req.session.userId,
            email 
        });

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email is already taken by another user
        const [existingUsers] = await db.promise().query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.session.userId]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Handle password change if provided
        if (currentPassword && newPassword) {
            if (newPassword.length < 4) {
                return res.status(400).json({ error: 'New password must be at least 4 characters long' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'New passwords do not match' });
            }

            // Verify current password
            const [users] = await db.promise().query('SELECT password FROM users WHERE id = ?', [req.session.userId]);
            const validPassword = await bcrypt.compare(currentPassword, users[0].password);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.promise().query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.session.userId]);
        }

        // Update basic profile info
        await db.promise().query(
            'UPDATE users SET name = ?, nickname = ?, email = ? WHERE id = ?',
            [name, nickname, email, req.session.userId]
        );

        // Handle profile image upload if present
        if (req.files && req.files.profileImage) {
            await logEvent('PROFILE_IMAGE_UPLOAD', { 
                userId: req.session.userId 
            });
            
            const profileImage = req.files.profileImage;
            const uploadDir = path.join(__dirname, 'uploads');
            
            // Create uploads directory if it doesn't exist
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            const fileName = `${req.session.userId}-${Date.now()}${path.extname(profileImage.name)}`;
            const filePath = path.join(uploadDir, fileName);
            
            await profileImage.mv(filePath);
            
            // Update profile image path in database
            await db.promise().query(
                'UPDATE users SET profile_image = ? WHERE id = ?',
                [`/uploads/${fileName}`, req.session.userId]
            );
        }

        await logEvent('PROFILE_UPDATE_SUCCESS', { 
            userId: req.session.userId,
            email,
            name,
            nickname
        });

        res.json({ success: true });
    } catch (error) {
        await logEvent('PROFILE_UPDATE_ERROR', { 
            userId: req.session.userId,
            error: error.message 
        });
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve profile page
app.get('/profile.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 