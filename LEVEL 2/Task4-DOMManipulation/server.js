const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Store registered users
let users = [];
let nextId = 1;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes - Simple render without passing data
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Himstun - User Registration'
        // No users data passed to avoid EJS issues
    });
});

// API: Get all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// API: Check username availability
app.post('/api/check-username', (req, res) => {
    const { username } = req.body;
    const isAvailable = !users.some(u => u.username === username);
    res.json({ available: isAvailable });
});

// API: Register new user
app.post('/api/register', (req, res) => {
    const { 
        username, 
        email, 
        phone, 
        password, 
        age,
        country,
        terms
    } = req.body;
    
    // Server-side validation
    let errors = [];
    
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters');
    } else if (users.some(u => u.username === username)) {
        errors.push('Username already taken');
    }
    
    if (!email || !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }
    
    if (!phone || !/^\d{10}$/.test(phone)) {
        errors.push('Phone must be exactly 10 digits');
    }
    
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || 
        !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
        errors.push('Password must be at least 8 chars with uppercase, lowercase, number and special character');
    }
    
    if (!age || age < 18 || age > 100) {
        errors.push('Age must be between 18 and 100');
    }
    
    if (!terms) {
        errors.push('You must accept terms');
    }
    
    if (errors.length > 0) {
        return res.json({ success: false, errors });
    }
    
    const newUser = {
        id: nextId++,
        username,
        email,
        phone,
        age: parseInt(age),
        country,
        registeredAt: new Date().toISOString(),
        preferences: {
            darkMode: false,
            language: 'english',
            notifications: true
        },
        activity: [{
            action: 'Account created',
            timestamp: new Date().toISOString()
        }]
    };
    
    users.push(newUser);
    console.log('New User Registered:', newUser.username);
    
    res.json({ 
        success: true, 
        user: newUser,
        message: 'Registration successful!'
    });
});

// API: Update user profile
app.post('/api/update-profile', (req, res) => {
    const { id, username, email, phone, age, country } = req.body;
    const userIndex = users.findIndex(u => u.id == id);
    
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            username,
            email,
            phone,
            age: parseInt(age),
            country,
            activity: [
                ...users[userIndex].activity,
                { action: 'Profile updated', timestamp: new Date().toISOString() }
            ]
        };
        res.json({ success: true, user: users[userIndex] });
    } else {
        res.json({ success: false, error: 'User not found' });
    }
});

// API: Update user preferences
app.post('/api/update-preferences', (req, res) => {
    const { id, darkMode, language, notifications } = req.body;
    const userIndex = users.findIndex(u => u.id == id);
    
    if (userIndex !== -1) {
        users[userIndex].preferences = {
            darkMode: darkMode !== undefined ? darkMode : users[userIndex].preferences.darkMode,
            language: language || users[userIndex].preferences.language,
            notifications: notifications !== undefined ? notifications : users[userIndex].preferences.notifications
        };
        
        users[userIndex].activity.push({
            action: `Preferences updated`,
            timestamp: new Date().toISOString()
        });
        
        res.json({ success: true, user: users[userIndex] });
    } else {
        res.json({ success: false, error: 'User not found' });
    }
});

// API: Delete user
app.post('/api/delete-user', (req, res) => {
    const { id } = req.body;
    users = users.filter(u => u.id != id);
    res.json({ success: true, users: users });
});

app.listen(PORT, () => {
    console.log(`✨ Himstun Server running at http://localhost:${PORT}`);
    console.log(`📋 API available at http://localhost:${PORT}/api/users`);
});