import nodemailer from 'nodemailer';
import pool from './db';

// Configuration
const SMTP_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
};

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Fallback for links
const BRAND_COLOR = '#34C6F4';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'digital.endeavour.in@gmail.com';

const transporter = nodemailer.createTransport(SMTP_CONFIG);

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

// --- Email Template Builder ---

interface TemplateOptions {
    title: string;
    body: string; // HTML content
    actionLabel?: string;
    actionUrl?: string;
    details?: { label: string; value: string }[];
}

function generateEmailHtml({ title, body, actionLabel, actionUrl, details }: TemplateOptions): string {
    const listItems = details
        ? details.map(d => `
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; font-size: 14px;">${d.label}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333; font-weight: 600; font-size: 14px; text-align: right;">${d.value}</td>
            </tr>
          `).join('')
        : '';

    const actionButton = actionLabel && actionUrl
        ? `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; margin-bottom: 24px;">
              <tr>
                <td align="center">
                  <a href="${actionUrl}" target="_blank" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(52, 198, 244, 0.2);">
                    ${actionLabel}
                  </a>
                </td>
              </tr>
            </table>
          `
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid ${BRAND_COLOR};">
       <h2 style="margin: 0; color: ${BRAND_COLOR}; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">BetterTalk.</h2>
    </div>

    <!-- Content -->
    <div style="padding: 32px 24px;">
      <h1 style="margin-top: 0; font-size: 22px; color: #1a202c; font-weight: bold;">${title}</h1>
      
      <div style="font-size: 16px; color: #4a5568; margin-top: 16px;">
        ${body}
      </div>

      ${details && details.length > 0 ? `
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                ${listItems}
            </table>
        </div>
      ` : ''}

      ${actionButton}

      <p style="font-size: 14px; color: #718096; margin-top: 32px; border-top: 1px solid #edf2f7; padding-top: 24px;">
        If the button above doesn't work, verify usage by copying and pasting this link into your browser:<br>
        <a href="${actionUrl}" style="color: ${BRAND_COLOR}; word-break: break-all;">${actionUrl || '#'}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #a0aec0;">
      <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} BetterTalk. All rights reserved.</p>
      <p style="margin: 0;">
        <a href="${BASE_URL}/contact" style="color: #a0aec0; text-decoration: underline;">Contact Support</a>
        <span style="margin: 0 8px;">•</span>
        <a href="${BASE_URL}/privacy" style="color: #a0aec0; text-decoration: underline;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;
}

// --- Core Sending Logic ---

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"BetterTalk" <${process.env.GMAIL_EMAIL}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}

export async function logNotification(
    userId: number,
    type: string,
    referenceType?: string | null,
    referenceId?: number | null,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string | null
) {
    try {
        await pool.execute(
            `INSERT INTO notification_logs (user_id, type, reference_type, reference_id, status, error_message) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                type,
                referenceType || null,
                referenceId || null,
                status,
                errorMessage || null
            ]
        );
    } catch (error) {
        console.error("Error logging notification:", error);
    }
}

export const NOTIFICATION_TYPES = {
    THERAPIST_APPLIED: 'therapist_applied',
    THERAPIST_APPROVED: 'therapist_approved',
    BOOKING_CREATED: 'booking_created',
    JOINING_LINK_ADDED: 'joining_link_added',
    CHAT_STARTED: 'chat_started',
    MANUAL_ALERT: 'manual_alert'
};

// --- Notifications ---

// 1. Therapist Applied
export async function notifyTherapistApplication(therapistUser: { id: number; email: string; name: string }) {
    // To Admin
    const adminHtml = generateEmailHtml({
        title: "New Therapist Application",
        body: `<p>A new therapist application has been received from <b>${therapistUser.name}</b>.</p><p>Please review their profile and credentials in the admin dashboard.</p>`,
        actionLabel: "Review Application",
        actionUrl: `${BASE_URL}/adx/therapists/${therapistUser.id}`,
        details: [
            { label: "Name", value: therapistUser.name },
            { label: "Email", value: therapistUser.email },
            { label: "Date", value: new Date().toLocaleDateString() }
        ]
    });
    await sendEmail({ to: ADMIN_EMAIL, subject: `New Application: ${therapistUser.name}`, html: adminHtml });

    // To Therapist
    const userHtml = generateEmailHtml({
        title: "Application Received",
        body: `<p>Hi ${therapistUser.name},</p><p>Thank you for applying to join BetterTalk! We have received your details.</p><p>Our team will review your application and notify you once approved.</p>`,
        details: [
            { label: "Reference ID", value: `#APP-${therapistUser.id}` },
            { label: "Status", value: "Under Review" }
        ]
    });
    const result = await sendEmail({ to: therapistUser.email, subject: "Application Received - BetterTalk", html: userHtml });

    await logNotification(therapistUser.id, NOTIFICATION_TYPES.THERAPIST_APPLIED, 'user', therapistUser.id, result.success ? 'success' : 'failed');
}

// 2. Therapist Approved
export async function notifyTherapistApproval(therapistUser: { id: number; email: string; name: string }) {
    const html = generateEmailHtml({
        title: "Application Approved! 🎉",
        body: `<p>Congratulations ${therapistUser.name}!</p><p>Your application to join BetterTalk has been approved. You are now a verified therapist on our platform.</p><p>Please log in to set up your availability and profile details.</p>`,
        actionLabel: "Login to Dashboard",
        actionUrl: `${BASE_URL}/therapist/login`
    });

    const result = await sendEmail({ to: therapistUser.email, subject: "Application Approved - BetterTalk", html });
    await logNotification(therapistUser.id, NOTIFICATION_TYPES.THERAPIST_APPROVED, 'user', therapistUser.id, result.success ? 'success' : 'failed');
}

// 3. New Booking
export async function notifyBookingCreated(
    bookingId: number,
    user: { id: number; email: string; name: string },
    therapist: { user_id: number; email: string; name: string; }
) {
    const dateStr = new Date().toLocaleDateString();

    // To Therapist
    const therapistHtml = generateEmailHtml({
        title: "New Session Booked",
        body: `<p>Good news! <b>${user.name}</b> has just booked a session with you.</p><p>Please ensure you are ready and have added a joining link before the session starts.</p>`,
        actionLabel: "View Session Details",
        actionUrl: `${BASE_URL}/therapist/sessions`,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Patient", value: user.name },
            { label: "Date Booked", value: dateStr }
        ]
    });
    await sendEmail({ to: therapist.email, subject: `New Session Booking from ${user.name}`, html: therapistHtml });

    // To Admin
    const adminHtml = generateEmailHtml({
        title: "Booking Created",
        body: `<p>A new booking has been confirmed on the platform.</p>`,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Therapist", value: therapist.name },
            { label: "Patient", value: user.name }
        ],
        actionLabel: "View in Admin Panel",
        actionUrl: `${BASE_URL}/adx/bookings`
    });
    await sendEmail({ to: ADMIN_EMAIL, subject: `New Booking #${bookingId}`, html: adminHtml });

    // To User
    const userHtml = generateEmailHtml({
        title: "Booking Confirmed! ✅",
        body: `<p>Hi ${user.name},</p><p>Your session with <b>${therapist.name}</b> has been successfully booked.</p><p>You will receive another email when your therapist adds the joining link.</p>`,
        actionLabel: "View My Sessions",
        actionUrl: `${BASE_URL}/sessions`,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Therapist", value: therapist.name }
        ]
    });
    const result = await sendEmail({ to: user.email, subject: "Booking Confirmed - BetterTalk", html: userHtml });

    await logNotification(user.id, NOTIFICATION_TYPES.BOOKING_CREATED, 'booking', bookingId, result.success ? 'success' : 'failed');
}

// 4 & 5. Joining Link Added
export async function notifyJoiningLinkAddedByTherapist(
    bookingId: number,
    user: { id: number; email: string; name: string },
    joiningLink: string
) {
    // To User
    const userHtml = generateEmailHtml({
        title: "Session Link Ready 📞",
        body: `<p>Hi ${user.name},</p><p>Your therapist has added the video call link for your upcoming session.</p><p>Please join at the scheduled time using the button below.</p>`,
        actionLabel: "Join Session Now",
        actionUrl: joiningLink,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Platform", value: "Video Call" }
        ]
    });
    const result = await sendEmail({ to: user.email, subject: "Join Session - Link Added", html: userHtml });

    // To Admin
    const adminHtml = generateEmailHtml({
        title: "Joining Link Added",
        body: `<p>Therapist added a joining link for booking #${bookingId}.</p>`,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Link", value: joiningLink }
        ]
    });
    await sendEmail({ to: ADMIN_EMAIL, subject: `Link Added: Booking #${bookingId}`, html: adminHtml });

    await logNotification(user.id, NOTIFICATION_TYPES.JOINING_LINK_ADDED, 'booking', bookingId, result.success ? 'success' : 'failed');
}

export async function notifyJoiningLinkAddedByAdmin(
    bookingId: number,
    user: { id: number; email: string; name: string },
    therapist: { user_id: number; email: string; name: string },
    joiningLink: string
) {
    const commonHtml = (name: string) => generateEmailHtml({
        title: "Session Link Updated",
        body: `<p>Hi ${name},</p><p>The admin has updated the joining link for session #${bookingId}.</p>`,
        actionLabel: "Join Session",
        actionUrl: joiningLink,
        details: [
            { label: "Booking ID", value: `#${bookingId}` },
            { label: "Updated By", value: "Admin" }
        ]
    });

    await sendEmail({ to: user.email, subject: "Session Link Updated", html: commonHtml(user.name) });
    await sendEmail({ to: therapist.email, subject: "Session Link Updated", html: commonHtml("Therapist") });

    await logNotification(user.id, NOTIFICATION_TYPES.JOINING_LINK_ADDED, 'booking', bookingId);
}

// 6. Manual & Chat Notifications
export async function sendManualNotification(to: string, subject: string, message: string, userIdForLog?: number) {
    // Simple detection if the message contains a URL and extracting it for button
    // This is a basic enhancement for the manual notifications
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlRegex);
    let actionUrl = undefined;
    let actionLabel = undefined;

    if (urls && urls.length > 0) {
        actionUrl = urls[0];
        actionLabel = "View Link";
    }

    const html = generateEmailHtml({
        title: subject,
        body: `<p>${message.replace(/\n/g, '<br>')}</p>`,
        actionLabel,
        actionUrl
    });

    const result = await sendEmail({ to, subject, html });
    if (userIdForLog) {
        await logNotification(userIdForLog, NOTIFICATION_TYPES.MANUAL_ALERT, undefined, undefined, result.success ? 'success' : 'failed');
    }
    return result;
}
