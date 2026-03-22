const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Store products
let products = [
    {
        id: 1,
        name: "Truffle Risotto",
        category: "Main Course",
        price: 42,
        originalPrice: 42,
        description: "Creamy arborio rice with black truffle and parmesan",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
        rating: 4.8,
        available: true,
        featured: true,
        stock: 45,
        discount: 0,
        popularity: "high"
    },
    {
        id: 2,
        name: "Lobster Thermidor",
        category: "Seafood",
        price: 68,
        originalPrice: 85,
        description: "Fresh lobster in creamy sauce with gratin",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
        rating: 4.9,
        available: true,
        featured: true,
        stock: 12,
        discount: 20,
        popularity: "very-high"
    },
    {
        id: 3,
        name: "Wagyu Beef",
        category: "Main Course",
        price: 95,
        originalPrice: 95,
        description: "A5 Japanese Wagyu with truffle sauce",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
        rating: 5.0,
        available: true,
        featured: true,
        stock: 8,
        discount: 0,
        popularity: "very-high"
    },
    {
        id: 4,
        name: "Chocolate Soufflé",
        category: "Dessert",
        price: 24,
        originalPrice: 24,
        description: "Dark chocolate with vanilla bean ice cream",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
        rating: 4.7,
        available: true,
        featured: false,
        stock: 32,
        discount: 0,
        popularity: "medium"
    },
    {
        id: 5,
        name: "Seafood Paella",
        category: "Seafood",
        price: 55,
        originalPrice: 55,
        description: "Saffron rice with shrimp, mussels, and calamari",
        image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop",
        rating: 4.6,
        available: true,
        featured: false,
        stock: 25,
        discount: 0,
        popularity: "high"
    },
    {
        id: 6,
        name: "French Onion Soup",
        category: "Appetizer",
        price: 18,
        originalPrice: 18,
        description: "Caramelized onions in rich broth with melted Gruyère",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
        rating: 4.5,
        available: true,
        featured: false,
        stock: 50,
        discount: 0,
        popularity: "medium"
    },
    {
        id: 7,
        name: "Signature Wine Selection",
        category: "Wine",
        price: 120,
        originalPrice: 150,
        description: "Premium Bordeaux blend, aged 5 years",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop",
        rating: 4.9,
        available: true,
        featured: true,
        stock: 15,
        discount: 20,
        popularity: "high"
    }
];

let nextId = 8;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== API ENDPOINTS ==========

// GET all products with filters
app.get('/api/products', (req, res) => {
    const { category, available, featured, minPrice, maxPrice, minRating, popularity } = req.query;
    let filtered = [...products];
    
    if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }
    
    if (available === 'true') {
        filtered = filtered.filter(item => item.available);
    } else if (available === 'false') {
        filtered = filtered.filter(item => !item.available);
    }
    
    if (featured === 'true') {
        filtered = filtered.filter(item => item.featured);
    }
    
    if (minPrice) {
        filtered = filtered.filter(item => item.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
        filtered = filtered.filter(item => item.price <= parseFloat(maxPrice));
    }
    
    if (minRating) {
        filtered = filtered.filter(item => item.rating >= parseFloat(minRating));
    }
    
    if (popularity && popularity !== 'all') {
        filtered = filtered.filter(item => item.popularity === popularity);
    }
    
    res.json(filtered);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const item = products.find(item => item.id === id);
    
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// POST - Create new product
app.post('/api/products', (req, res) => {
    const { name, category, price, description, image, rating, available, featured, stock, discount, popularity } = req.body;
    
    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Name, category, and price are required' });
    }
    
    const newItem = {
        id: nextId++,
        name,
        category,
        price: parseFloat(price),
        originalPrice: parseFloat(price),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        rating: rating ? parseFloat(rating) : 0,
        available: available !== undefined ? available : true,
        featured: featured || false,
        stock: stock || 50,
        discount: discount || 0,
        popularity: popularity || 'medium'
    };
    
    products.push(newItem);
    res.status(201).json(newItem);
});

// PUT - Update product
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(item => item.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const { name, category, price, description, image, rating, available, featured, stock, discount, popularity } = req.body;
    
    products[index] = {
        ...products[index],
        name: name || products[index].name,
        category: category || products[index].category,
        price: price ? parseFloat(price) : products[index].price,
        description: description !== undefined ? description : products[index].description,
        image: image || products[index].image,
        rating: rating ? parseFloat(rating) : products[index].rating,
        available: available !== undefined ? available : products[index].available,
        featured: featured !== undefined ? featured : products[index].featured,
        stock: stock !== undefined ? stock : products[index].stock,
        discount: discount !== undefined ? discount : products[index].discount,
        popularity: popularity || products[index].popularity
    };
    
    res.json(products[index]);
});

// PATCH - Toggle availability
app.patch('/api/products/:id/toggle', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(item => item.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products[index].available = !products[index].available;
    res.json(products[index]);
});

// DELETE - Remove product
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(item => item.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(index, 1);
    res.json({ message: 'Product deleted successfully' });
});

// GET statistics
app.get('/api/stats', (req, res) => {
    const stats = {
        totalProducts: products.length,
        availableProducts: products.filter(item => item.available).length,
        averagePrice: products.reduce((sum, item) => sum + item.price, 0) / products.length,
        categories: [...new Set(products.map(item => item.category))].length,
        totalStock: products.reduce((sum, item) => sum + item.stock, 0),
        featuredCount: products.filter(item => item.featured).length,
        onSaleCount: products.filter(item => item.discount > 0).length
    };
    res.json(stats);
});

// Serve main page
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Himstun - Product Management'
    });
});

app.listen(PORT, () => {
    console.log(`✨ Himstun Product Management Server running at http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   GET    /api/products - Get all products`);
    console.log(`   POST   /api/products - Create product`);
    console.log(`   PUT    /api/products/:id - Update product`);
    console.log(`   DELETE /api/products/:id - Delete product`);
    console.log(`   GET    /api/stats - Get statistics`);
});
;