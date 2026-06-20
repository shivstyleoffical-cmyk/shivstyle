import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});




const sendmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return;
            }
            console.log('Email sent:', info.response);
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default {
    sendmail,
    transporter,
}
