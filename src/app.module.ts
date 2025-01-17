import {ClassSerializerInterceptor, Module} from "@nestjs/common";
import {HelperModule} from "./common/services/helper.module";
import {CacheModule} from "@nestjs/cache-manager";
import {ThrottlerModule} from "@nestjs/throttler";
import {ScheduleModule} from "@nestjs/schedule";
import {AppController} from "./app.controller";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as dotenv from "dotenv";
import KeyvRedis, {Keyv} from "@keyv/redis";
import {CacheableMemory} from "cacheable";

dotenv.config();

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
            imports: [ConfigModule],
            inject: [ConfigService],
            isGlobal: true,
            useFactory: async(configService: ConfigService) => {
                const redisUrl = configService.get("REDIS_URL");
                return {
                    stores: [
                        redisUrl
                            ? new KeyvRedis(redisUrl)
                            : new Keyv({
                                store: new CacheableMemory(),
                            }),
                    ],
                };
            },
        }),
        HelperModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule{}
