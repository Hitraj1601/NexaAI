import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        // Create reusable transporter object using SMTP transport
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // Your email
                pass: process.env.SMTP_PASS, // Your app password
            },
        });
    }

    // Verify connection configuration
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send messages');
            return true;
        } catch (error) {
            console.error('❌ Email service connection failed:', error);
            return false;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email, resetToken, username) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"NexaAI Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request - NexaAI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #333; margin-bottom: 10px;">NexaAI</h1>
                        <h2 style="color: #666; font-weight: normal;">Password Reset Request</h2>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #333; margin-bottom: 15px;">Hello ${username},</p>
                        
                        <p style="color: #333; margin-bottom: 15px;">
                            We received a request to reset your password for your NexaAI account. 
                            If you didn't make this request, you can safely ignore this email.
                        </p>
                        
                        <p style="color: #333; margin-bottom: 20px;">
                            To reset your password, click the button below:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                                      display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                            If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        <p style="color: #007bff; font-size: 14px; word-break: break-all;">${resetUrl}</p>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; color: #666; font-size: 14px;">
                        <p><strong>Important Security Information:</strong></p>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>This link will expire in 1 hour for security reasons</li>
                            <li>You can only use this link once</li>
                            <li>If you didn't request this reset, please contact support</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px;">
                            This email was sent by NexaAI. If you have any questions, 
                            please contact our support team.
                        </p>
                    </div>
                </div>
            `,
            text: `
                Hello ${username},
                
                We received a request to reset your password for your NexaAI account.
                
                To reset your password, visit this link: ${resetUrl}
                
                If you didn't make this request, you can safely ignore this email.
                
                This link will expire in 1 hour for security reasons.
                
                Best regards,
                NexaAI Team
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    // Send password reset success confirmation email
    async sendPasswordResetSuccessEmail(email, username) {
        const mailOptions = {
            from: `"NexaAI Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Successfully Reset - NexaAI',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #333; margin-bottom: 10px;">NexaAI</h1>
                        <h2 style="color: #28a745; font-weight: normal;">Password Successfully Reset</h2>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
                        <p style="color: #333; margin-bottom: 15px;">Hello ${username},</p>
                        
                        <p style="color: #333; margin-bottom: 15px;">
                            Your password has been successfully reset for your NexaAI account.
                        </p>
                        
                        <p style="color: #333; margin-bottom: 15px;">
                            If you did not make this change, please contact our support team immediately.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin" 
                               style="background-color: #28a745; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                                      display: inline-block;">
                                Sign In Now
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px;">
                            This email was sent by NexaAI. If you have any questions, 
                            please contact our support team.
                        </p>
                    </div>
                </div>
            `,
            text: `
                Hello ${username},
                
                Your password has been successfully reset for your NexaAI account.
                
                If you did not make this change, please contact our support team immediately.
                
                You can now sign in with your new password at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin
                
                Best regards,
                NexaAI Team
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset success email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Error sending password reset success email:', error);
            // Don't throw error here as this is not critical
            return false;
        }
    }
}

export default new EmailService();