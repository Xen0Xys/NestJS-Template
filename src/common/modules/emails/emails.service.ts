import type {EmailsModuleOptions} from "./interfaces/emails-module-options.interface";
import {Inject, Injectable} from "@nestjs/common";
import {EMAILS_OPTIONS} from "./constants";
import nodemailer from "nodemailer";

@Injectable()
export class EmailsService{
    private readonly transporter: nodemailer.Transporter;

    constructor(
        @Inject(EMAILS_OPTIONS) private optionsService: EmailsModuleOptions,
    ){
        this.transporter = nodemailer.createTransport(this.optionsService.url);
    }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void>{
        await this.transporter.sendMail({
            from: this.optionsService.from,
            to,
            subject,
            text,
            html,
        });
    }
}
