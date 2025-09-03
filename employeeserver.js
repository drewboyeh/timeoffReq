const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'time-off-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    }
}));

// Data storage files
const USERS_FILE = 'users.json';
const REQUESTS_FILE = 'time-off-requests.json';
const MESSAGES_FILE = 'messages.json';

// Initialize data files if they don't exist
function initializeDataFiles() {
    console.log('Current working directory:', process.cwd());
    console.log('Users file path:', USERS_FILE);
    console.log('Requests file path:', REQUESTS_FILE);
    console.log('Messages file path:', MESSAGES_FILE);
    
    if (!fs.existsSync(USERS_FILE)) {
        const defaultUsers = {
            employees: [
                {
                    id: 'emp-001',
                    username: 'john.doe',
                    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
                    name: 'John Doe',
                    role: 'employee',
                    email: 'john.doe@company.com'
                },
                {
                    id: 'emp-002',
                    username: 'jane.smith',
                    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
                    name: 'Jane Smith',
                    role: 'employee',
                    email: 'jane.smith@company.com'
                }
            ],
            managers: [
                {
                    id: 'mgr-001',
                    username: 'manager1',
                    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
                    name: 'Manager One',
                    role: 'manager',
                    email: 'manager1@company.com',
                    ptoBalance: 7,
                    ptoYear: new Date().getFullYear()
                }
            ],
            admins: [
                {
                    id: 'admin-001',
                    username: 'Yvonne.Cullen',
                    password: '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ',
                    name: 'Yvonne Cullen',
                    role: 'admin',
                    email: 'yvonne.cullen@company.com'
                }
            ]
        };
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    }

    if (!fs.existsSync(REQUESTS_FILE)) {
        console.log('Requests file does not exist, creating it');
        fs.writeFileSync(REQUESTS_FILE, JSON.stringify([], null, 2));
    } else {
        console.log('Requests file exists, checking contents');
        try {
            const content = fs.readFileSync(REQUESTS_FILE, 'utf8');
            console.log('Current requests file content:', content);
        } catch (error) {
            console.error('Error reading existing requests file:', error);
        }
    }

    if (!fs.existsSync(MESSAGES_FILE)) {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
    }
}

// Load data functions
function loadUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
        return { employees: [], managers: [], admins: [] };
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

function loadRequests() {
    try {
        console.log('Loading requests from file:', REQUESTS_FILE);
        const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
        console.log('Raw file data:', data);
        const requests = JSON.parse(data);
        console.log('Parsed requests:', requests);
        return requests;
    } catch (error) {
        console.error('Error loading requests:', error);
        return [];
    }
}

function saveRequests(requests) {
    try {
        console.log('Saving requests to file:', REQUESTS_FILE);
        console.log('Requests to save:', requests);
        const jsonData = JSON.stringify(requests, null, 2);
        console.log('JSON data to write:', jsonData);
        fs.writeFileSync(REQUESTS_FILE, jsonData);
        console.log('Successfully saved requests to file');
        
        // Verify the save by reading it back
        const savedData = fs.readFileSync(REQUESTS_FILE, 'utf8');
        console.log('Verification - saved data:', savedData);
    } catch (error) {
        console.error('Error saving requests:', error);
    }
}

function loadMessages() {
    try {
        const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading messages:', error);
        return [];
    }
}

function saveMessages(messages) {
    try {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error('Error saving messages:', error);
    }
}

// Authentication middleware
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

function requireManager(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'manager') {
        return res.status(403).json({ error: 'Manager access required' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    
    // Ensure users has the correct structure
    if (!users || !users.employees || !users.managers || !users.admins) {
        console.error('Invalid users structure:', users);
        return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Find user in employees, managers, or admins
    let user = users.employees.find(emp => emp.username === username);
    if (!user) {
        user = users.managers.find(mgr => mgr.username === username);
    }
    if (!user) {
        user = users.admins.find(admin => admin.username === username);
    }
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // For demo purposes, accept any password (in production, use bcrypt.compare)
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = true; // Demo mode
    
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
    };
    
    res.json({ 
        success: true, 
        user: req.session.user 
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user: req.session.user });
});

// Submit time-off request (no authentication required)
app.post('/api/time-off-requests', (req, res) => {
    try {
        const { firstName, lastName, employeeName, startDate, endDate, startTime, endTime, reason, type, storeLocation } = req.body;
        
        if (!firstName || !lastName || !startDate || !endDate || !reason || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const requests = loadRequests();
        const newRequest = {
            id: uuidv4(),
            employeeId: `emp-${uuidv4().slice(0, 8)}`, // Generate temporary ID
            employeeName: employeeName || `${firstName} ${lastName}`,
            firstName,
            lastName,
            startDate,
            endDate,
            startTime: startTime || null,
            endTime: endTime || null,
            reason,
            type, // 'full-day', 'half-day', 'specific-hours'
            storeLocation: storeLocation || 'Not specified',
            status: 'pending',
            submittedAt: new Date().toISOString(),
            approvedBy: null,
            approvedAt: null,
            comments: null
        };
        
        console.log('Submitting new request:', newRequest);
        console.log('Current requests before adding:', requests);
        
        requests.push(newRequest);
        console.log('Requests after adding new one:', requests);
        
        saveRequests(requests);
        
        console.log('Total requests after save:', requests.length);
        
        res.json({ success: true, request: newRequest });
    } catch (error) {
        console.error('Error submitting time-off request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get time-off requests (filtered by role)
app.get('/api/time-off-requests', requireAuth, (req, res) => {
    try {
        const requests = loadRequests();
        
        // Double-check session after requireAuth
        if (!req.session || !req.session.user) {
            console.log('Session lost after requireAuth middleware');
            return res.status(401).json({ error: 'User session not found' });
        }
        
        console.log('Loading requests for user:', req.session.user.username, 'Role:', req.session.user.role);
        console.log('Total requests loaded:', requests.length);
        
        if (req.session.user.role === 'employee') {
            // Employees see only their own requests
            const userRequests = requests.filter(request => {
                console.log('Checking request:', request.employeeId, 'vs user:', req.session.user.id);
                return request.employeeId === req.session.user.id;
            });
            console.log('Employee requests found:', userRequests.length);
            res.json({ requests: userRequests });
        } else if (req.session.user.role === 'manager') {
            // Managers see all requests
            console.log('Manager viewing all requests:', requests.length);
            res.json({ requests });
        } else if (req.session.user.role === 'admin') {
            // Admin sees all requests
            console.log('Admin viewing all requests:', requests.length);
            res.json({ requests });
        } else {
            res.json({ requests: [] });
        }
    } catch (error) {
        console.error('Error loading time-off requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get time-off requests by name (for employees without login)
app.get('/api/time-off-requests/by-name/:firstName/:lastName', (req, res) => {
    try {
        const { firstName, lastName } = req.params;
        const requests = loadRequests();
        
        // Filter requests by first and last name
        const userRequests = requests.filter(request => 
            request.firstName === firstName && request.lastName === lastName
        );
        
        res.json({ requests: userRequests });
    } catch (error) {
        console.error('Error loading requests by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all time-off requests (for anonymous users to see all requests)
app.get('/api/time-off-requests/all', (req, res) => {
    try {
        const requests = loadRequests();
        res.json({ requests });
    } catch (error) {
        console.error('Error loading all time-off requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve/deny request (managers and admins)
app.put('/api/time-off-requests/:requestId', requireAuth, (req, res) => {
    // Check if user is manager or admin
    if (!req.session.user || (req.session.user.role !== 'manager' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Manager or admin access required' });
    }
    const { requestId } = req.params;
    const { status, comments } = req.body;
    
    if (!['approved', 'denied'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    
    const requests = loadRequests();
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) {
        return res.status(404).json({ error: 'Request not found' });
    }
    
    requests[requestIndex].status = status;
    requests[requestIndex].comments = comments;
    requests[requestIndex].approvedBy = req.session.user.id;
    requests[requestIndex].approvedAt = new Date().toISOString();
    
    // Special handling for PTO requests approved by admin
    if (status === 'approved' && requests[requestIndex].type === 'pto' && req.session.user.role === 'admin') {
        const users = loadUsers();
        const manager = users.managers.find(m => m.id === requests[requestIndex].employeeId);
        if (manager && requests[requestIndex].daysRequested) {
            manager.ptoBalance = (manager.ptoBalance || 7) - requests[requestIndex].daysRequested;
            saveUsers(users);
        }
    }
    
    saveRequests(requests);
    
    res.json({ success: true, request: requests[requestIndex] });
});

// Delete time-off request (managers and admins only)
app.delete('/api/time-off-requests/:requestId', requireAuth, (req, res) => {
    console.log('Delete request received for ID:', req.params.requestId);
    console.log('User:', req.session.user.username, 'Role:', req.session.user.role);
    
    // Check if user is manager or admin
    if (!req.session.user || (req.session.user.role !== 'manager' && req.session.user.role !== 'admin')) {
        console.log('Access denied - user role:', req.session.user?.role);
        return res.status(403).json({ error: 'Manager or admin access required' });
    }
    
    const { requestId } = req.params;
    const requests = loadRequests();
    console.log('Total requests before deletion:', requests.length);
    
    const requestIndex = requests.findIndex(req => req.id === requestId);
    console.log('Request index found:', requestIndex);
    
    if (requestIndex === -1) {
        console.log('Request not found with ID:', requestId);
        return res.status(404).json({ error: 'Request not found' });
    }
    
    // Remove the request
    const deletedRequest = requests.splice(requestIndex, 1)[0];
    console.log('Deleted request:', deletedRequest);
    
    saveRequests(requests);
    console.log('Total requests after deletion:', requests.length);
    
    res.json({ success: true, message: 'Request deleted successfully' });
});

// Get employees list (managers and admins)
app.get('/api/employees', requireAuth, (req, res) => {
    // Check if user is manager or admin
    if (!req.session.user || (req.session.user.role !== 'manager' && req.session.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Manager or admin access required' });
    }
    const users = loadUsers();
    const employees = users.employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email
    }));
    res.json({ employees });
});

// Add new employee (managers only)
app.post('/api/employees', requireManager, async (req, res) => {
    const { username, name, email, password } = req.body;
    
    if (!username || !name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const users = loadUsers();
    
    // Check if username already exists
    const existingUser = [...users.employees, ...users.managers].find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = {
        id: `emp-${uuidv4().slice(0, 8)}`,
        username,
        password: hashedPassword,
        name,
        role: 'employee',
        email
    };
    
    users.employees.push(newEmployee);
    saveUsers(users);
    
    res.json({ 
        success: true, 
        employee: {
            id: newEmployee.id,
            username: newEmployee.username,
            name: newEmployee.name,
            email: newEmployee.email,
            role: newEmployee.role
        }
    });
});

// Messaging endpoints

// Get all users (for admin messaging)
app.get('/api/users', requireAdmin, (req, res) => {
    const users = loadUsers();
    const allUsers = [
        ...users.employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            username: emp.username
        })),
        ...users.managers.map(mgr => ({
            id: mgr.id,
            name: mgr.name,
            email: mgr.email,
            role: mgr.role,
            username: mgr.username
        }))
    ];
    res.json({ users: allUsers });
});

// Send message (admin only)
app.post('/api/messages', requireAdmin, (req, res) => {
    const { recipientId, subject, message } = req.body;
    
    if (!recipientId || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const users = loadUsers();
    const allUsers = [...users.employees, ...users.managers];
    const recipient = allUsers.find(u => u.id === recipientId);
    
    if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
    }
    
    const messages = loadMessages();
    const newMessage = {
        id: uuidv4(),
        fromId: req.session.user.id,
        fromName: req.session.user.name,
        toId: recipientId,
        toName: recipient.name,
        subject,
        message,
        sentAt: new Date().toISOString(),
        read: false
    };
    
    messages.push(newMessage);
    saveMessages(messages);
    
    res.json({ success: true, message: newMessage });
});

// Get messages for current user
app.get('/api/messages', requireAuth, (req, res) => {
    const messages = loadMessages();
    const userMessages = messages.filter(msg => 
        msg.toId === req.session.user.id || msg.fromId === req.session.user.id
    );
    res.json({ messages: userMessages });
});

// Mark message as read
app.put('/api/messages/:messageId/read', requireAuth, (req, res) => {
    const { messageId } = req.params;
    const messages = loadMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
        return res.status(404).json({ error: 'Message not found' });
    }
    
    // Only recipient can mark as read
    if (messages[messageIndex].toId !== req.session.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    messages[messageIndex].read = true;
    saveMessages(messages);
    
    res.json({ success: true });
});

// PTO (Paid Time Off) endpoints for managers

// Get manager's PTO balance
app.get('/api/pto/balance', requireManager, (req, res) => {
    const users = loadUsers();
    const manager = users.managers.find(m => m.id === req.session.user.id);
    
    if (!manager) {
        return res.status(404).json({ error: 'Manager not found' });
    }
    
    // Reset PTO balance if it's a new year
    const currentYear = new Date().getFullYear();
    if (!manager.ptoYear || manager.ptoYear !== currentYear) {
        manager.ptoBalance = 7;
        manager.ptoYear = currentYear;
        saveUsers(users);
    }
    
    res.json({ 
        balance: manager.ptoBalance || 7,
        year: currentYear
    });
});

// Submit PTO request (managers only)
app.post('/api/pto/request', requireManager, (req, res) => {
    const { startDate, endDate, reason, storeLocation } = req.body;
    
    if (!startDate || !endDate || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const users = loadUsers();
    const manager = users.managers.find(m => m.id === req.session.user.id);
    
    if (!manager) {
        return res.status(404).json({ error: 'Manager not found' });
    }
    
    // Calculate days requested
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    // Check if manager has enough PTO balance
    const currentBalance = manager.ptoBalance || 7;
    if (daysRequested > currentBalance) {
        return res.status(400).json({ 
            error: `Insufficient PTO balance. You have ${currentBalance} days remaining, but requested ${daysRequested} days.` 
        });
    }
    
    // Create PTO request (requires admin approval)
    const requests = loadRequests();
    const newRequest = {
        id: uuidv4(),
        employeeId: manager.id,
        employeeName: manager.name,
        startDate,
        endDate,
        reason,
        storeLocation: storeLocation || 'Not specified',
        type: 'pto',
        status: 'pending', // PTO requests now require admin approval
        submittedAt: new Date().toISOString(),
        daysRequested: daysRequested,
        comments: 'Awaiting admin approval'
    };
    
    requests.push(newRequest);
    saveRequests(requests);
    
    // Don't deduct PTO balance until approved
    
    res.json({ 
        success: true, 
        request: newRequest,
        message: 'PTO request submitted and awaiting admin approval'
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'employee.html'));
});



// Initialize data files
initializeDataFiles();

// Start server
app.listen(PORT, () => {
    console.log(`Time-off request system running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
    console.log('\nDemo Accounts:');
    console.log('Employee: john.doe / any password');
    console.log('Employee: jane.smith / any password');
    console.log('Manager: manager1 / any password');
    console.log('Admin: Yvonne.Cullen / any password');
}); 