const express = require('express');
const path = require('path');
const app = express();

// Temporary storage for your "Vault"
let securityLogs = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { success: false, error: null, logs: securityLogs });
});

app.post('/register', (req, res) => {
    const { name, email, pass } = req.body;

    // Server-side security check
    if (!pass || pass.length < 8) {
        return res.render('index', { 
            success: false, 
            error: "PROTOCOL ERROR: Key must be 8+ characters.", 
            logs: securityLogs 
        });
    }

    // Add to logs
    securityLogs.push({ name, email, time: new Date().toLocaleTimeString() });
    res.render('index', { success: true, error: null, logs: securityLogs });
});

// Using Port 4000 to avoid any old browser cache
app.listen(4000, () => console.log('SECURITY PORTAL LIVE: http://localhost:4000'));