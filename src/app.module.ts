import {MailerModule} from "@nestjs-modules/mailer";
import {ThrottlerModule} from "@nestjs/throttler";
import {UsersModule} from "./users/users.module";
import {AuthModule} from "./auth/auth.module";
import {ConfigModule} from "@nestjs/config";
import {Module} from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 50,
        }]),
        MailerModule.forRoot({
            transport: {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT),
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                }
            },
        }),
        UsersModule,
        AuthModule
    ]
})
export class AppModule{}
