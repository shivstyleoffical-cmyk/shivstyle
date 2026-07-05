export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p><strong>Note:</strong> This code will expire in 24 hours.</p>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;






export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Our Community!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="#" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;


export const Forgot_Password_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #FF9800;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .reset-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #FF9800;
              background: #fff3e0;
              border: 1px dashed #FF9800;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Reset Your Password</div>
          <div class="content">
              <p>Hello,</p>
              <p>You recently requested to reset your password. Please use the code below to proceed:</p>
              <span class="reset-code">{resetCode}</span>
              <p><strong>Note:</strong> This code will expire in 10 minutes.</p>
              <p>If you did not request a password reset, please ignore this email. No changes will be made without confirmation.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

export const Order_Placed_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Placed Successfully</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fafafa;
            color: #1a1a1a;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #eaeaea;
        }
        .header {
            background-color: #09090b;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .content {
            padding: 30px;
            line-height: 1.6;
        }
        .order-info {
            background-color: #f4f4f5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info table {
            width: 100%;
            border-collapse: collapse;
        }
        .order-info td {
            padding: 6px 0;
            font-size: 14px;
        }
        .order-number {
            font-family: monospace;
            font-weight: 700;
            color: #09090b;
        }
        .support-card {
            background-color: #eef2ff;
            border: 1px solid #e0e7ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0 10px;
        }
        .support-card h3 {
            margin-top: 0;
            color: #312e81;
            font-size: 15px;
            font-weight: 700;
        }
        .support-card p {
            margin: 5px 0;
            font-size: 13px;
            color: #3730a3;
        }
        .support-link {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            background-color: #f4f4f5;
            padding: 20px;
            text-align: center;
            color: #71717a;
            font-size: 12px;
            border-top: 1px solid #eaeaea;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ShivStyle Official</h1>
        </div>
        <div class="content">
            <p>Hello {name},</p>
            <p>Thank you for shopping with us! Your order has been placed successfully and is now being processed.</p>
            
            <div class="order-info">
                <table>
                    <tr>
                        <td style="color: #71717a;">Order Number:</td>
                        <td class="order-number" align="right">{orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="color: #71717a;">Amount Paid:</td>
                        <td style="font-weight: 700;" align="right">{netAmount}</td>
                    </tr>
                    <tr>
                        <td style="color: #71717a;">Payment Method:</td>
                        <td style="text-transform: uppercase; font-weight: 600;" align="right">{paymentType}</td>
                    </tr>
                </table>
            </div>

            <p>We are packing your items and getting them ready for shipment. You will receive another email with your tracking details (AWB number) and link as soon as your package leaves our warehouse.</p>
            
            <div class="support-card">
                <h3>Need Assistance? We're here to help!</h3>
                <p>Feel free to reach out to our customer care team at any time:</p>
                <p style="margin-top: 10px;">📧 Email: <a href="mailto:shivstyleofficial@gmail.com" class="support-link">shivstyleofficial@gmail.com</a></p>
                <p>📞 Phone/WhatsApp: <a href="tel:+917001916432" class="support-link">+91 70019 16432</a></p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {year} ShivStyle Official. All rights reserved.</p>
            <p>Crafted with pride in India.</p>
        </div>
    </div>
</body>
</html>
`;

export const Order_Shipped_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Been Shipped</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fafafa;
            color: #1a1a1a;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #eaeaea;
        }
        .header {
            background-color: #09090b;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .content {
            padding: 30px;
            line-height: 1.6;
        }
        .order-info {
            background-color: #f4f4f5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info table {
            width: 100%;
            border-collapse: collapse;
        }
        .order-info td {
            padding: 6px 0;
            font-size: 14px;
        }
        .tracking-number {
            font-family: monospace;
            font-weight: 700;
            color: #4f46e5;
            font-size: 15px;
        }
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 28px;
            background-color: #09090b;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }
        .support-card {
            background-color: #eef2ff;
            border: 1px solid #e0e7ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0 10px;
        }
        .support-card h3 {
            margin-top: 0;
            color: #312e81;
            font-size: 15px;
            font-weight: 700;
        }
        .support-card p {
            margin: 5px 0;
            font-size: 13px;
            color: #3730a3;
        }
        .support-link {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            background-color: #f4f4f5;
            padding: 20px;
            text-align: center;
            color: #71717a;
            font-size: 12px;
            border-top: 1px solid #eaeaea;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ShivStyle Official</h1>
        </div>
        <div class="content">
            <p>Hello {name},</p>
            <p>Great news! Your package is on its way. We have handed over your order to our courier partner and generated your tracking details.</p>
            
            <div class="order-info">
                <table>
                    <tr>
                        <td style="color: #71717a;">Order Number:</td>
                        <td style="font-family: monospace; font-weight: 700; color: #09090b;" align="right">{orderNumber}</td>
                    </tr>
                    <tr>
                        <td style="color: #71717a;">Courier Partner:</td>
                        <td style="font-weight: 700; color: #09090b;" align="right">{courier}</td>
                    </tr>
                    <tr>
                        <td style="color: #71717a;">AWB / Tracking ID:</td>
                        <td class="tracking-number" align="right">{trackingNumber}</td>
                    </tr>
                </table>
            </div>

            <div class="button-container">
                <a href="https://shiprocket.co/tracking/{trackingNumber}" target="_blank" class="button">Track My Package</a>
            </div>

            <p>You can also trace this directly in our app's track order portal using your Order ID at any time.</p>
            
            <div class="support-card">
                <h3>Need Assistance? We're here to help!</h3>
                <p>Feel free to reach out to our customer care team at any time:</p>
                <p style="margin-top: 10px;">📧 Email: <a href="mailto:shivstyleofficial@gmail.com" class="support-link">shivstyleofficial@gmail.com</a></p>
                <p>📞 Phone/WhatsApp: <a href="tel:+917001916432" class="support-link">+91 70019 16432</a></p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; {year} ShivStyle Official. All rights reserved.</p>
            <p>Crafted with pride in India.</p>
        </div>
    </div>
</body>
</html>
`;
