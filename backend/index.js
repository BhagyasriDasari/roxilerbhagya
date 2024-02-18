const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors()); // Allow all origins - Replace with specific origin if needed
app.use(express.json());

// Routes
const tasksRouter = require('./routes/tasks');
app.use('/tasks', tasksRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});