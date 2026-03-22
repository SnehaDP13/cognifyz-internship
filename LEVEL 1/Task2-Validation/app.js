const express = require('express');
const path = require('path');
const app = express();

let registeredUsers = []; 

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { 
        success: false, 
        error: null, 
        users: registeredUsers 
    });
});

app.post('/register', (req, res) => {
    const { name, email, pass } = req.body;

    // Task 2: Server-side validation [cite: 73]
    if (!pass || pass.length < 8) {
        return res.render('index', { 
            success: false, 
            error: "SECURITY BREACH: Key must be 8+ characters.",
            users: registeredUsers 
        });
    }

    registeredUsers.push({ name, email, time: new Date().toLocaleTimeString() });
    res.render('index', { success: true, error: null, users: registeredUsers });
});

app.listen(3001, () => console.log('Task 2 Portal: http://localhost:3001'));