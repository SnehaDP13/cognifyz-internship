const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Store bookings
let bookings = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Himstun Restaurant',
        success: null,
        bookingData: null,
        errors: null,
        formData: {},
        bookings: bookings
    });
});

// Handle form submission
app.post('/book-table', (req, res) => {
    const { name, phone, date, time, guests, specialRequest, seating } = req.body;
    
    // Server-side validation
    let errors = [];
    
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!phone || !/^\d{10}$/.test(phone)) {
        errors.push('Phone number must be exactly 10 digits');
    }
    
    if (!date) {
        errors.push('Please select a date');
    } else {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.push('Please select a future date');
        }
    }
    
    if (!time) {
        errors.push('Please select a time');
    }
    
    if (!guests || guests < 1 || guests > 20) {
        errors.push('Number of guests must be between 1 and 20');
    }
    
    // Check for duplicate booking
    const existingBooking = bookings.find(b => 
        b.name === name && 
        b.phone === phone && 
        b.date === date && 
        b.time === time
    );
    
    if (existingBooking) {
        errors.push('A booking already exists for this name, date, and time');
    }
    
    if (errors.length > 0) {
        return res.render('index', { 
            title: 'Himstun Restaurant',
            success: null,
            bookingData: null,
            errors: errors,
            formData: { name, phone, date, time, guests, specialRequest, seating },
            bookings: bookings
        });
    }
    
    // Create new booking
    const booking = { 
        id: Date.now(),
        name, 
        phone, 
        date, 
        time, 
        guests: parseInt(guests),
        specialRequest: specialRequest || '',
        seating: seating || 'indoor',
        bookedAt: new Date(),
        status: 'confirmed'
    };
    
    bookings.push(booking);
    console.log('New Booking:', booking);
    
    // Render with success message and booking data for popup
    res.render('index', { 
        title: 'Himstun Restaurant',
        success: 'Booking confirmed successfully!',
        bookingData: booking,  // Pass booking data to show in popup
        errors: null,
        formData: {},
        bookings: bookings
    });
});

// Cancel booking
app.post('/cancel-booking', (req, res) => {
    const { bookingId } = req.body;
    bookings = bookings.filter(b => b.id != bookingId);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`✨ Himstun Restaurant Server running at http://localhost:${PORT}`);
});