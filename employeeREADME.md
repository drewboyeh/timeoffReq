# Time-Off Request Management System

A comprehensive web application for managing employee time-off requests with role-based access control for employees and managers.

## Features

### Employee Features
- **Week-by-Week Calendar Interface**: Visual calendar for selecting time-off dates
- **Flexible Time Selection**: Support for full-day, half-day, and specific hour requests
- **Request Management**: View and track the status of submitted requests
- **User-Friendly Interface**: Modern, responsive design with intuitive navigation

### Manager Features
- **Request Approval Dashboard**: Review and approve/deny employee requests
- **Employee Management**: Add new employees to the system
- **Statistics Overview**: View request statistics and trends
- **Comprehensive Request View**: See all employee requests with filtering options

### System Features
- **Role-Based Authentication**: Separate login systems for employees and managers
- **Session Management**: Secure user sessions with automatic logout
- **Data Persistence**: JSON-based storage for users and requests
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Authentication**: Express-session with bcrypt password hashing
- **Data Storage**: JSON files (users.json, time-off-requests.json)
- **Styling**: Custom CSS with modern gradient designs

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd /path/to/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## Demo Accounts

The system comes with pre-configured demo accounts for testing:

### Employee Accounts
- **Username**: `john.doe` | **Password**: Any password (demo mode)
- **Username**: `jane.smith` | **Password**: Any password (demo mode)

### Manager Account
- **Username**: `manager1` | **Password**: Any password (demo mode)

## Usage Guide

### For Employees

1. **Login**: Use your employee credentials to access the system
2. **Calendar Navigation**: Use the Previous/Next buttons to navigate between weeks
3. **Select Dates**: Click on calendar days to select your time-off dates
4. **Submit Request**: Fill out the request form with:
   - Start and end dates (auto-filled from calendar selection)
   - Request type (full-day, half-day, or specific hours)
   - Time range (for specific hours requests)
   - Reason for time-off
5. **Track Requests**: View your submitted requests and their approval status

### For Managers

1. **Login**: Use your manager credentials to access the system
2. **Dashboard Overview**: View statistics and pending requests
3. **Review Requests**: See all employee time-off requests
4. **Approve/Deny**: Click approve or deny buttons for pending requests
5. **Add Employees**: Use the employee management section to add new employees
6. **Provide Feedback**: Add comments when denying requests

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Time-Off Requests
- `POST /api/time-off-requests` - Submit new request (employees only)
- `GET /api/time-off-requests` - Get requests (filtered by role)
- `PUT /api/time-off-requests/:id` - Approve/deny request (managers only)

### Employee Management
- `GET /api/employees` - Get employees list (managers only)
- `POST /api/employees` - Add new employee (managers only)

## Data Structure

### User Types
```json
{
  "employees": [
    {
      "id": "emp-001",
      "username": "john.doe",
      "password": "hashed_password",
      "name": "John Doe",
      "role": "employee",
      "email": "john.doe@company.com"
    }
  ],
  "managers": [
    {
      "id": "mgr-001",
      "username": "manager1",
      "password": "hashed_password",
      "name": "Manager One",
      "role": "manager",
      "email": "manager1@company.com"
    }
  ]
}
```

### Time-Off Request Structure
```json
{
  "id": "uuid",
  "employeeId": "emp-001",
  "employeeName": "John Doe",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "startTime": "09:00",
  "endTime": "17:00",
  "reason": "Personal vacation",
  "type": "full-day",
  "status": "pending",
  "submittedAt": "2024-01-10T10:30:00Z",
  "approvedBy": null,
  "approvedAt": null,
  "comments": null
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **Session Management**: Secure session handling with automatic expiration
- **Role-Based Access**: Strict separation between employee and manager functions
- **Input Validation**: Server-side validation for all user inputs
- **CSRF Protection**: Session-based request validation

## Customization

### Adding New Features
1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Modify the HTML/JavaScript in `public/index.html`
3. **Styling**: Update CSS styles in the `<style>` section

### Database Migration
To switch from JSON files to a proper database:
1. Replace the file I/O functions in `server.js`
2. Update the data loading/saving functions
3. Modify the API endpoints to use database queries

### Styling Customization
The application uses a modern gradient design that can be easily customized:
- Primary colors: `#667eea` to `#764ba2`
- Secondary colors: `#f8f9fa`, `#e9ecef`
- Success colors: `#28a745`
- Danger colors: `#dc3545`

## Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Configure a reverse proxy (nginx)
4. Set up SSL certificates for HTTPS

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is already in use
   - Verify all dependencies are installed
   - Check Node.js version compatibility

2. **Login issues**
   - Verify demo account credentials
   - Check browser console for errors
   - Ensure cookies are enabled

3. **Calendar not working**
   - Check JavaScript console for errors
   - Verify browser compatibility
   - Clear browser cache

### Logs
Server logs are displayed in the console when running the application. Check for:
- Authentication attempts
- Request submissions
- Error messages
- Database operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Examine the browser console for errors
4. Verify server logs for backend issues

---

**Note**: This is a demo application with simplified authentication. For production use, implement proper security measures including HTTPS, secure session management, and database security. 