import nodemailer from "nodemailer";
import config from "../../config";

export const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: 465,
    secure: true,
    auth: {
        user: config.smtp.login,
        pass: config.smtp.pass
    },
    tls: {
        rejectUnauthorized: false
    }
});