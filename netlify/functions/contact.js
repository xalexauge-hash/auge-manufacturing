const nodemailer = require('nodemailer');

// This is a simple contact form handler for Netlify Functions
// You need to configure your email credentials in Netlify environment variables

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { name, email, phone, company, subject, message } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Format the email content in tabular format
    const emailHTML = `
      <h2>Neue Anfrage von ${name}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">E-Mail</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefon</td>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td>
        </tr>
        ` : ''}
        ${company ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Unternehmen</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${company}</td>
        </tr>
        ` : ''}
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Betreff</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Nachricht</td>
          <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `Neue Anfrage: ${subject}`,
      html: emailHTML,
      text: `Name: ${name}\nE-Mail: ${email}\n${phone ? `Telefon: ${phone}\n` : ''}${company ? `Unternehmen: ${company}\n` : ''}Betreff: ${subject}\n\nNachricht:\n${message}`
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Vielen Dank für Ihre Anfrage - AUGE Manufacturing',
      html: `
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        <p>Lieber ${name},</p>
        <p>wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
        <hr style="margin: 20px 0;">
        <h3>Ihre Anfrage:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Betreff</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Mit freundlichen Grüßen<br>AUGE Manufacturing</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Anfrage erfolgreich gesendet! Wir werden uns schnellstmöglich bei Ihnen melden.' 
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' 
      })
    };
  }
};
