import nodemailer from "nodemailer"
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from "./templates"

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro)

    const mailOptions = {
        from: `"Stocket" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Welcome to Stocket - your stock market toolkit is ready!',
        text: 'Thanks for joining Stocket',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions)
}

export interface DailyNewsEmailData {
    email: string;
    newsContent: string;
    date?: string;
}

export const sendDailyNewsEmail = async ({ email, newsContent, date }: DailyNewsEmailData) => {
    const today = date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', today)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Stocket" <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject: 'Your Daily Market News Summary',
        text: 'Here is your daily market news summary.',
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
}
