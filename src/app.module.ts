import {MailerModule} from "@nestjs-modules/mailer";
import {ThrottlerModule} from "@nestjs/throttler";
import {UsersModule} from "./modules/users/users.module";
import {AuthModule} from "./modules/auth/auth.module";
import {CronModule} from "./modules/cron/cron.module";
import {ScheduleModule} from "@nestjs/schedule";
import {ConfigModule} from "@nestjs/config";
import {Module} from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
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
        CronModule,
        UsersModule,
        AuthModule
    ]
})
export class AppModule{}
