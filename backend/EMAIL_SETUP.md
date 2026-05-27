# Email Service Setup for Password Reset

This guide will help you set up the email service for password reset functionality in your NexaAI project.

## Prerequisites

1. Gmail account (or other SMTP provider)
2. App-specific password for Gmail (recommended) or regular password

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account settings > Security
2. Under "Signing in to Google", select "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter "NexaAI Backend" as the device name
5. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Add these variables to your backend `.env` file:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-app-specific-password-here

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:5173
```

## Other SMTP Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-outlook-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-yahoo-email@yahoo.com
SMTP_PASS=your-app-password
```

## API Endpoints

The following endpoints have been added to your API:

### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Body:** `{ "email": "user@example.com" }`
- **Response:** Success message

### Reset Password
- **POST** `/api/auth/reset-password`
- **Body:** `{ "token": "reset-token", "newPassword": "new-password" }`
- **Response:** Success message

### Verify Reset Token
- **GET** `/api/auth/verify-reset-token/:token`
- **Response:** Token validity and associated email

## Frontend Routes

The following routes have been added to your frontend:

- `/forgot-password` - Form to request password reset
- `/reset-password?token=xyz` - Form to set new password

## Database Changes

The User model has been updated with new fields:
- `resetPasswordToken` - Hashed token for password reset
- `resetPasswordExpires` - Token expiration timestamp

## Security Features

1. **Token Expiration:** Reset tokens expire after 1 hour
2. **One-time Use:** Tokens are deleted after successful password reset
3. **Secure Hashing:** Tokens are hashed before storing in database
4. **Rate Limiting:** Built-in protection against email spam
5. **Secure Email Templates:** Professional HTML email templates

## Testing the Setup

1. Start your backend server
2. Check the console for email service verification message
3. Try the forgot password flow:
   - Go to `/signin` and click "Forgot password?"
   - Enter your email address
   - Check your email inbox (and spam folder)
   - Click the reset link
   - Enter a new password

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error**
   - Make sure you're using an app-specific password, not your regular Gmail password
   - Check that 2FA is enabled on your Google account

2. **"Connection timeout" error**
   - Verify SMTP settings are correct
   - Check if your hosting provider blocks SMTP ports

3. **Emails not received**
   - Check spam/junk folders
   - Verify the email address exists
   - Check server logs for sending errors

4. **Reset link not working**
   - Ensure FRONTEND_URL is set correctly
   - Check if the token has expired (1 hour limit)
   - Verify the frontend routes are properly configured

## Customization

### Email Templates
You can customize the email templates in `backend/src/utils/emailService.js`:
- Modify HTML styling
- Change email content
- Add your company branding

### Token Expiry
To change token expiry time, modify this line in `user.controller.js`:
```javascript
user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
```

### SMTP Settings
To use a different email provider, update the transporter configuration in `emailService.js`.

## Production Considerations

1. **Environment Variables**: Ensure all SMTP credentials are properly set in production
2. **SSL/TLS**: Use secure connections in production
3. **Rate Limiting**: Consider implementing additional rate limiting for forgot password requests
4. **Monitoring**: Monitor email delivery success rates
5. **Backup SMTP**: Consider having a backup SMTP provider

## Support

If you encounter issues, check:
1. Server logs for detailed error messages
2. Email provider documentation
3. Firewall/security group settings
4. DNS resolution for SMTP servers