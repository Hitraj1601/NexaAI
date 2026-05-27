# NexaAI
This is an AI SaaS web application with comprehensive user management and AI-powered tools.

## Features

### User Authentication & Security
- **User Registration & Login** - Secure JWT-based authentication
- **Password Reset via Email** - Complete forgot password workflow with email verification
- **Account Management** - Profile management and account deletion

### AI-Powered Tools
- **Article Writer** - Generate high-quality articles
- **Title Generator** - Create engaging titles
- **Image Generator** - AI-generated images
- **Background Remover** - Remove backgrounds from images

### Dashboard & Management
- **User Dashboard** - Centralized control panel
- **History Tracking** - Track your AI generation history
- **Profile Settings** - Manage your account settings

## Quick Setup

### Email Service Configuration
The application includes a complete password reset system via email. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed configuration instructions.

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/nexaai
ACCESS_TOKEN_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-reset-token/:token` - Verify reset token

### User Management
- `DELETE /api/auth/delete-account` - Delete user account

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email services
- bcrypt for password hashing

### Frontend
- React with TypeScript
- React Router for navigation
- TailwindCSS for styling
- Shadcn/ui components

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Secure password reset with time-limited tokens
- Email verification system
- CORS protection
- Input validation and sanitization

## Contributing
Feel free to submit issues and pull requests to improve the application.
