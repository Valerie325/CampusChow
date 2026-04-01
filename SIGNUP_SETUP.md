# CampusChow Sign-Up Setup Guide

## Overview
The CampusChow application now includes a complete sign-up page with support for both traditional email/password registration and Google OAuth authentication.

## Features

✅ **Traditional Sign-Up**
- Full name, email, phone, and password registration
- Password strength validation (min 8 chars, uppercase, lowercase, numbers)
- Email validation
- Terms & conditions checkbox
- Real-time error messages

✅ **Google OAuth Sign-Up**
- One-click sign-up with Google account
- Automatic user profile creation
- Avatar import from Google account

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your configuration:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campuschow
JWT_SECRET=your_secure_secret_key_123
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
API_URL=http://localhost:5000
```

### 2. Google OAuth Configuration

#### Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5000`
6. Copy your **Client ID**
7. Paste in `.env` file as `GOOGLE_CLIENT_ID`

#### Update Frontend
In `sign.html`, replace:
```javascript
client_id: 'YOUR_GOOGLE_CLIENT_ID_HERE'
```
with your actual Google Client ID:
```javascript
client_id: 'your_google_client_id.apps.googleusercontent.com'
```

### 3. Database Setup

Ensure MongoDB is running:
```bash
# If using MongoDB Atlas, skip this
# If using local MongoDB:
mongod
```

### 4. Start the Application

#### Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Frontend
```bash
# Open in browser
open index.html
# or navigate to sign-up page
open sign.html
```

## API Endpoints

### POST `/api/auth/signup`
**Traditional Sign-Up**

Request:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+233XXXXXXXXX",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+233XXXXXXXXX"
  },
  "token": "jwt_token_here"
}
```

### POST `/api/auth/google-signup`
**Google OAuth Sign-Up**

Request:
```json
{
  "token": "google_jwt_token"
}
```

Response:
```json
{
  "success": true,
  "message": "Signed up with Google successfully",
  "user": {
    "id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "token": "jwt_token_here"
}
```

### POST `/api/auth/login`
**Login**

Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt_token_here"
}
```

## Frontend Integration

### Redirect After Sign-Up
After successful sign-up, users are automatically redirected to `index.html`. Update this in `sign.html` if needed:

```javascript
window.location.href = 'desired-page.html';
```

### Storing User Token
The JWT token is returned after login/signup. Store it in localStorage:

```javascript
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Using Token for Authenticated Requests
```javascript
const token = localStorage.getItem('token');
fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## File Structure

```
CampusChow/
├── sign.html                 # Sign-up page
├── backend/
│   ├── server.js
│   ├── models/
│   │   └── User.js          # Updated with new fields
│   ├── routes/
│   │   └── authRoutes.js    # Updated with signup endpoints
│   └── .env.example         # Environment variables template
└── [other files]
```

## Security Considerations

✅ **Passwords**: Hashed with bcryptjs (10 salt rounds)
✅ **JWT**: Signed with JWT_SECRET
✅ **CORS**: Enabled for specified origins
✅ **Validation**: Client-side and server-side
✅ **Google**: Original JWT token is verified before processing

### Best Practices Implementation

1. ✅ Password strength validation
2. ✅ Email uniqueness check in database
3. ✅ HTTPS recommended for production
4. ✅ Environment variables for secrets
5. ✅ Error handling with meaningful messages

## Troubleshooting

### "Google Sign-In is not available"
- Ensure Google Client ID is correctly set
- Check internet connection
- Clear browser cache

### "Email already registered"
- User already has an account
- Suggest login instead

### "MongoDB connection failed"
- Check MONGO_URI in `.env`
- Ensure MongoDB is running
- Verify network connectivity

### CORS Errors
- Update CORS configuration in `server.js` if using different frontend URL
- Ensure API_URL matches frontend requests

## Next Steps

1. Link sign-up page in main navigation
2. Add "Forgot Password" functionality
3. Implement email verification
4. Add profile completion page after sign-up
5. Setup password reset flow
6. Add user profile management

---

**Last Updated**: March 31, 2026
**Version**: 1.0.0
