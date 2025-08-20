const express = require('express');
const cors = require('cors')
const path = require('path')


const connectDB = require('./database');

const app = express();
app.use(cors())
app.set('view engine', 'ejs'); // Set EJS as templating engine
app.set('views', path.join(__dirname, 'views')); // Set views directory
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

// Login route - GET method with database authentication
app.get('/login', async (req, res) => {
    const username = req.query.username;
    const password = req.query.password; 
   
    // console.log('Login attempt:', { username, password });
    
    // If no credentials provided, show login page
    if (!username || !password) {
        res.send("<h1>Login Page</h1><p>Please provide username and password</p>");
        return;
    }
    
    try {
        // Connect to database
        const db = await connectDB();
        const users = db.collection('users');
        
        // Check if user exists in database
        const user = await users.findOne({ 
            email: username, 
            password: password 
        });
        
        if (user) {
            // User found - Login successful
            console.log('Login successful for:', username);
            res.render('index', { title: 'Welcome', message: 'Hello from EJS!' });
            // res.send(`
            //     <h1>Welcome ${username}!</h1>
            //     <p>Login successful!</p>
            //     <p>Email: ${user.email}</p>
            //     <p>Account created: ${user.createdAt}</p>
            //     <a href="/login.html">Logout</a>
            // `);
        } else {
            // User not found - Login failed
            console.log('Login failed for:', username);
            res.send(`
                <h1>Login Failed</h1>
                <p>Invalid username or password</p>
                <a href="/register.html">Try Again</a>
            `);
        }
        
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send(`
            <h1>Server Error</h1>
            <p>Something went wrong during login</p>
            <a href="/login.html">Try Again</a>
        `);
    }
});

// User registration route - POST method
app.post('/user', async (req, res) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        
        const username = req.body.username;
        const email = req.body.email;
        const password1 = req.body.password1;
        const password2 = req.body.password2;
        
        // Check if user already exists
        const existingUser = await users.findOne({ 
            name: username, 
            email: email 
        });
        
        if (existingUser) {
            console.log('User already exists');
            res.send("user")
            // res.redirect('/login');
            return;
        }
        
        // Check if passwords match
        if (password1 !== password2) {
            console.log('Passwords do not match');
            res.status(400).send('Passwords do not match');
            return;
        }
        
        // Insert new user
        await users.insertOne({ 
            name: username, 
            email: email, 
            password: password1,
            createdAt: new Date()
        });
        
        // console.log('User registered successfully');
        res.redirect('/login')
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
