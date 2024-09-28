
import { validateMailForm } from "../../utils";
import rateLimit from "express-rate-limit";
import { transporter } from "../../utils/mailer";
import config from "../../../config";

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many requests from this IP, please try again later.',
    validate: {xForwardedForHeader: false}
});

export default async function handler(req, res) {
    limiter(req, res, async () => {
        const input = validateMailForm(req.body);

        if(!input) return res.sendStatus(400);
    
        try {
            await transporter.sendMail({
                from: config.smtp.login,
                to: config.smtp.recivier.split(","),
                subject: `email from ${input.f_name} ${input.l_name} for kaimouni.com`,
                html: `
                    <h4>Full Name: ${input.f_name} ${input.l_name}</h4>
                    <h4>Phone: ${input.phone}</h4>
                    <h4>Email: ${input.email}</h4>
                    <h4>Objective: ${input.objective}</h4>
                    <p>${input.message}</p>
                `
            });

            await transporter.sendMail({
                from: config.smtp.login,
                to: input.email,
                subject: `kaimouni.com  - Confirmation of your message`,
                html: `We got  your message! we contact you as soon as possible.`
            });
    
            return res.sendStatus(200);
        } catch(error) {
            console.error(error);
    
            return res.sendStatus(500);
        }
    })
}
