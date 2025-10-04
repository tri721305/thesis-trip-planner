import nodemailer from "nodemailer";

export const sendInvitationEmail = async (
  recipientEmail: string,
  planner: any,
  inviterName: string
) => {
  try {
    // Cấu hình transporter - trong môi trường thực tế nên lấy từ biến môi trường
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your-password",
      },
    });

    const plannerTitle = planner.title || "a travel planner";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationUrl = `${appUrl}/invitations`;

    await transporter.sendMail({
      from: `"Travel Planner" <${process.env.EMAIL_FROM || "noreply@tripplanner.com"}>`,
      to: recipientEmail,
      subject: `${inviterName} has invited you to join "${plannerTitle}"`,
      text: `Hello,\n\n${inviterName} has invited you to join their travel planner "${plannerTitle}".\n\nTo accept or decline this invitation, please visit: ${invitationUrl}\n\nBest regards,\nThe Travel Planner Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Travel Invitation</h2>
          <p><strong>${inviterName}</strong> has invited you to join their travel planner "${plannerTitle}".</p>
          <p>To accept or decline this invitation, please click the button below:</p>
          <a href="${invitationUrl}" style="display: inline-block; background-color: #ff7e33; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 15px;">
            View Invitation
          </a>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>The Travel Planner Team</p>
        </div>
      `,
    });

    console.log(`Invitation email sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return false;
  }
};
