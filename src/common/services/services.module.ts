import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";
import {EmailService} from "./email.service";
import {TotpService} from "./totp.service";
import {JwtService} from "./jwt.service";
import {Module} from "@nestjs/common";

@Module({
    providers: [
        CipherService,
        EmailService,
        JwtService,
        PrismaService,
        TotpService,
    ],
    exports: [
        CipherService,
        EmailService,
        JwtService,
        PrismaService,
        TotpService,
    ]
})
export class ServicesModule{}
