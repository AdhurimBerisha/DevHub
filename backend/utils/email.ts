import nodemailer from "nodemailer";
import "dotenv/config";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.GMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
    username: string
  ) {
    const verificationUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"DevHub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your DevHub Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">DevHub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up for DevHub! To complete your registration and start sharing your knowledge, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <!-- Primary button with better email client compatibility -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 25px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                    <a href="${verificationUrl}" 
                       target="_blank"
                       style="display: inline-block; 
                              padding: 15px 30px; 
                              color: white; 
                              text-decoration: none; 
                              border-radius: 25px; 
                              font-weight: bold;
                              font-size: 16px;
                              line-height: 1.2;
                              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                              border: none;
                              outline: none;">
                      ✅ Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Alternative text link for better compatibility -->
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                <strong>Having trouble with the button?</strong>
              </p>
              <a href="${verificationUrl}" 
                 target="_blank"
                 style="color: #3b82f6; 
                        text-decoration: underline; 
                        font-weight: bold;
                        font-size: 16px;">
                Click here to verify your email
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If neither option works, you can copy and paste this link into your browser:
            </p>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; margin-bottom: 20px;">
              <code style="color: #495057; font-family: 'Courier New', monospace; font-size: 14px;">
                ${verificationUrl}
              </code>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>💡 Tip:</strong> Some email clients may block buttons. If the button doesn't work, 
                try the text link above or copy-paste the URL into your browser.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              This verification link will expire in 24 hours. If you didn't create a DevHub account, 
              you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © ${new Date().getFullYear()} DevHub. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    username: string
  ) {
    const resetUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"DevHub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Your DevHub Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">DevHub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              This reset link will expire in 1 hour for security reasons.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © ${new Date().getFullYear()} DevHub. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }

  async sendEmailChangeVerificationEmail(
    newEmail: string,
    verificationToken: string,
    username: string,
    oldEmail: string
  ) {
    const verificationUrl = `${process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email-change?token=${verificationToken}`;

    const mailOptions = {
      from: `"DevHub" <${process.env.GMAIL_USER}>`,
      to: newEmail,
      subject: "Verify Your New DevHub Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">DevHub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Change Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              You requested to change your DevHub email address from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              To complete the email change, please verify your new email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 25px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                    <a href="${verificationUrl}" 
                       target="_blank"
                       style="display: inline-block; 
                              padding: 15px 30px; 
                              color: white; 
                              text-decoration: none; 
                              border-radius: 25px; 
                              font-weight: bold;
                              font-size: 16px;
                              line-height: 1.2;
                              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                              border: none;
                              outline: none;">
                      ✅ Verify New Email
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                <strong>Having trouble with the button?</strong>
              </p>
              <a href="${verificationUrl}" 
                 target="_blank"
                 style="color: #3b82f6; 
                        text-decoration: underline; 
                        font-weight: bold;
                        font-size: 16px;">
                Click here to verify your new email
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this email change, please ignore this email and contact support immediately.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              This verification link will expire in 24 hours. Your email will remain as <strong>${oldEmail}</strong> until you verify the new address.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © ${new Date().getFullYear()} DevHub. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email change verification email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email change verification email:", error);
      throw error;
    }
  }

  async sendEmailChangeNotificationEmail(
    oldEmail: string,
    username: string,
    newEmail: string
  ) {
    const mailOptions = {
      from: `"DevHub" <${process.env.GMAIL_USER}>`,
      to: oldEmail,
      subject: "DevHub Email Change Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">DevHub</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Change Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This is a notification that you requested to change your DevHub email address from:
            </p>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
              <p style="color: #495057; margin: 0; font-size: 16px;">
                <strong>Old Email:</strong> ${oldEmail}<br>
                <strong>New Email:</strong> ${newEmail}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              A verification email has been sent to <strong>${newEmail}</strong>. The email change will only be completed after you verify the new email address.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this email change, please contact support immediately to secure your account.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 25px; font-size: 14px;">
              Your current email (${oldEmail}) will remain active until the new email is verified.
            </p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; text-align: center; font-size: 12px;">
              © ${new Date().getFullYear()} DevHub. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email change notification sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email change notification:", error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      return false;
    }
  }
}

export default new EmailService();

