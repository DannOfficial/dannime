import nodemailer from 'nodemailer';

/**
 * Create email transporter
 */
export function createTransporter() {
  if (!"danigtps@gmail.com" || !"whpkvwdkmohfbdbv") {
    console.warn('SMTP credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    port: "587",
    auth: {
      user: "danigtps@gmail.com",
      pass: "whpkvwdkmohfbdbv",
    },
  });
}

/**
 * Generate 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(email, otp, name = 'User') {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service is not configured. Please add SMTP credentials to .env file.');
  }

  const mailOptions = {
    from: `"DannNime - Verification Email"`,
    to: email,
    subject: 'Verify Your Email - DannNime',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .otp-box {
            background-color: #f0f0f0;
            border: 2px dashed #667eea;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            margin: 20px 0;
            border-radius: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 DannNime</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with DannNime. Please use the following OTP to verify your email address:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            
            <p>If you didn't request this verification, please ignore this email.</p>
            
            <p>Happy watching!<br>The DannNime Team</p>
          </div>
          <div class="footer">
            <p>© 2025 DannNime. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send broadcast email to multiple users
 */
export async function sendBroadcastEmail(recipients, subject, htmlContent) {
  const transporter = createTransporter();
  
  if (!transporter) {
    throw new Error('Email service is not configured. Please add SMTP credentials to .env file.');
  }

  const mailOptions = {
    from: `"DannNime" <${process.env.SMTP_EMAIL}>`,
    bcc: recipients, // Use BCC for privacy
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 DannNime</h1>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="footer">
            <p>© 2025 DannNime. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    throw error;
  }
}

/**
 * Send level up notification email
 */
export async function sendLevelUpEmail(email, name, newLevel, newRole) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn('Email service not configured. Skipping level-up email.');
    return false;
  }

  const mailOptions = {
    from: `"DannNime - Notification"`,
    to: email,
    subject: `🎉 Congratulations! You've reached Level ${newLevel}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            text-align: center;
          }
          .level-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
          }
          .role-badge {
            background-color: #ffd700;
            color: #333;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 DannNime</h1>
            <p>Level Up!</p>
          </div>
          <div class="content">
            <h2>🎉 Congratulations ${name}!</h2>
            <p>You've leveled up!</p>
            
            <div class="level-badge">Level ${newLevel}</div>
            <div class="role-badge">${newRole} Rank</div>
            
            <p>Keep watching anime to level up even more!</p>
            
            <p>Happy watching!<br>The DannNime Team</p>
          </div>
          <div class="footer">
            <p>© 2025 DannNime. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending level-up email:', error);
    return false;
  }
}
