import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {HelperModule} from "./common/modules/helper/helper.module";
import {ThrottlerModule} from "@nestjs/throttler";
import {ScheduleModule} from "@nestjs/schedule";
import {AppController} from "./app.controller";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule} from "@nestjs/config";
import {CacheModule} from "@nestjs/cache-manager";
import KeyvRedis from "@keyv/redis";
import {CacheableMemory} from "cacheable";
import {AuthModule} from "./common/modules/auth/auth.module";

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
                const redisUrl = process.env.REDIS_URL;
                return {
                    stores: [
                        redisUrl
                            ? new KeyvRedis(redisUrl)
                            : new CacheableMemory(),
                        // new Keyv(),
                    ],
                };
            },
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
