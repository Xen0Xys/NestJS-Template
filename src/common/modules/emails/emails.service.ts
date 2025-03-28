import type {EmailsModuleOptions} from "./interfaces/emails-module-options.interface";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {EMAILS_OPTIONS} from "./constants";
import * as nodemailer from "nodemailer";
import {CipherService} from "../helper/cipher.service";

@Injectable()
export class EmailsService{
    private readonly transporter: nodemailer.Transporter;
    private readonly logger: Logger = new Logger(EmailsService.name);

    constructor(
        @Inject(EMAILS_OPTIONS) private readonly optionsService: EmailsModuleOptions,
        private readonly cipherService: CipherService,
    ){
        if(this.optionsService.url)
            this.transporter = nodemailer.createTransport(this.optionsService.url);
    }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void>{
        const maskedEmail = this.cipherService.maskEmail(to);
        this.logger.log(`Sending email to ${maskedEmail}`);
        await this.transporter.sendMail({
            from: this.optionsService.from,
            to,
            subject,
            text,
            html,
        });
        this.logger.log(`Email sent to ${maskedEmail}`);
    }

    async sendEmailVerification(to: string, code: string): Promise<void>{
        await this.transporter.sendMail({
            from: this.optionsService.from,
            to,
            subject: "Email Verification",
            text: "Click here to verify your email",
            html: `<a href="${process.env.FRONTEND_URL}/auth/email-verification?code=${code}">Click here to verify your email</a>`,
        });
    }

    async sendMagicLink(email: string, token: string): Promise<void>{
        await this.transporter.sendMail({
            from: this.optionsService.from,
            to: email,
            subject: "Magic Link",
            text: "Click here to login",
            html: `<a href="${process.env.FRONTEND_URL}/auth/callback?token=${token}">Click here to login</a>`,
        });
    }
}
