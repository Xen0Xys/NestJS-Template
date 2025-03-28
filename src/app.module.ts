import {HelperModule} from "./common/modules/helper/helper.module";
import {EmailsModule} from "./common/modules/emails/emails.module";
import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {AuthModule} from "./common/modules/auth/auth.module";
import {ThrottlerModule} from "@nestjs/throttler";
import {CacheModule} from "@nestjs/cache-manager";
import {ScheduleModule} from "@nestjs/schedule";
import {AppController} from "./app.controller";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule} from "@nestjs/config";
import {CacheableMemory} from "cacheable";
import KeyvRedis from "@keyv/redis";

@Module({
    controllers: [AppController],
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 60,
        }]),
        ScheduleModule.forRoot(),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async(): Promise<any> => {
                const redisUrl: string | undefined = process.env.REDIS_URL;
                return {
                    stores: [
                        redisUrl
                            ? new KeyvRedis(redisUrl)
                            : new CacheableMemory(),
                    ],
                };
            },
        }),
        EmailsModule.forRoot({
            isGlobal: true,
            url: process.env.EMAIL_URL,
            from: process.env.EMAIL_FROM,
        }),
        HelperModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule{}
