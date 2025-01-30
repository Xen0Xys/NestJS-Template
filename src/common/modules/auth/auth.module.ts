import {RegisterController} from "./register.controller";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {LoginController} from "./login.controller";
import {AuthController} from "./auth.controller";
import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {LoginService} from "./login.service";
import {RegisterService} from "./register.service";
import {UsersModule} from "../../../modules/users/users.module";
import {ConfigService} from "@nestjs/config";
import {AuthJwtStrategy} from "./strategies/auth-jwt.strategy";

@Module({
    controllers: [AuthController, LoginController, RegisterController],
    providers: [JwtStrategy, AuthJwtStrategy, LoginService, RegisterService],
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("APP_KEY"),
                signOptions: {
                    expiresIn: "7d",
                    algorithm: "HS512",
                    issuer: configService.get<string>("APP_NAME"),
                },
                verifyOptions: {
                    algorithms: ["HS512"],
                    issuer: configService.get<string>("APP_NAME"),
                },
            }),
        }),
        UsersModule,
    ],
})
export class AuthModule{}
