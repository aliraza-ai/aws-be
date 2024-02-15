const nodemailer = require("nodemailer");

// Function to generate a random verification code
function generateVerificationCode(length) {
  const characters = "0123456789";
  let verificationCode = "";
  for (let i = 0; i < length; i++) {
    verificationCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return verificationCode;
}

// Function to send verification code via email
async function sendVerificationCode(email) {
  // Generate verification code
  const verificationCode = generateVerificationCode(6); 

  // Create Nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Provide your SMTP configuration here
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: {
      user: "your_email@example.com",
      pass: "your_password",
    },
  });

  // Email message options
  const mailOptions = {
    from: "your_email@example.com",
    to: email,
    subject: "Email Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  try {
    // Send mail with defined transport object
    await transporter.sendMail(mailOptions);
    console.log("Verification code sent successfully.");
    return verificationCode;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw new Error("Failed to send verification code.");
  }
}

// Example usage
const userEmail = "recipient@example.com";
sendVerificationCode(userEmail)
  .then((verificationCode) => {
    console.log("Verification code:", verificationCode);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
