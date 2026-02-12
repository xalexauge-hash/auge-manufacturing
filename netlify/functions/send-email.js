const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Parse multipart form data
    const boundary = event.headers['content-type'].split('boundary=')[1];
    const parts = parseMultipart(event.body, boundary);
    
    // Extract form fields
    const fields = {};
    const attachments = [];
    
    parts.forEach(part => {
      if (part.filename) {
        // It's a file
        attachments.push({
          filename: part.filename,
          content: part.data,
          contentType: part.contentType || 'application/octet-stream'
        });
      } else if (part.name) {
        // It's a form field
        fields[part.name] = part.data.toString('utf-8');
      }
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Build email HTML
    const emailHtml = `
      <h2>Neue Kontaktanfrage</h2>
      <p><strong>Name:</strong> ${fields.name || 'N/A'}</p>
      <p><strong>E-Mail:</strong> ${fields.email || 'N/A'}</p>
      <p><strong>Telefon:</strong> ${fields.phone || 'N/A'}</p>
      <p><strong>Unternehmen:</strong> ${fields.company || 'N/A'}</p>
      <p><strong>Betreff:</strong> ${fields.subject || 'N/A'}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${(fields.message || '').replace(/\n/g, '<br>')}</p>
      ${attachments.length > 0 ? `<p><strong>Anhänge:</strong> ${attachments.length} Datei(en)</p>` : ''}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      replyTo: fields.email,
      subject: `Kontaktanfrage: ${fields.subject || 'Keine Betreffzeile'}`,
      html: emailHtml,
      attachments: attachments
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' })
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email', error: error.message })
    };
  }
};

// Simple multipart/form-data parser
function parseMultipart(body, boundary) {
  const parts = [];
  const bodyBuffer = Buffer.from(body, 'binary');
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let start = 0;
  let end = bodyBuffer.indexOf(boundaryBuffer, start);
  
  while (end !== -1) {
    start = end + boundaryBuffer.length;
    end = bodyBuffer.indexOf(boundaryBuffer, start);
    
    if (end === -1) break;
    
    const partBuffer = bodyBuffer.slice(start, end);
    const headerEnd = partBuffer.indexOf('\r\n\r\n');
    
    if (headerEnd === -1) continue;
    
    const headers = partBuffer.slice(0, headerEnd).toString('utf-8');
    const data = partBuffer.slice(headerEnd + 4, partBuffer.length - 2); // Remove trailing \r\n
    
    // Parse Content-Disposition
    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/);
    
    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: contentTypeMatch ? contentTypeMatch[1] : null,
        data: data
      });
    }
  }
  
  return parts;
}
