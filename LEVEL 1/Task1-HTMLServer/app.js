const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Task 1: Basic Server Interaction [cite: 57]
app.get('/', (req, res) => {
    res.render('index', { data: null });
});

app.post('/submit', (req, res) => {
    const { name, email, role } = req.body;
    // Task 1: Dynamically generate HTML [cite: 63]
    res.render('index', { data: { name, email, role } });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Cognifyz Task 1 Live: http://localhost:${PORT}`));