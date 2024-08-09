import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {MailerService} from "@nestjs-modules/mailer";

@Injectable()
export class EmailService{
    constructor(
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ){}

    async sendEmail(to: string, subject: string, body: string): Promise<void>{
        await this.mailerService.sendMail({
            from: this.configService.get("EMAIL_USER"),
            to,
            subject,
            text: body,
        });
    }
}
