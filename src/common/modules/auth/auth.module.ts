import {UsersModule} from "../../../modules/users/users.module";
import {AuthJwtStrategy} from "./strategies/auth-jwt.strategy";
import {RegisterController} from "./register.controller";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {LoginController} from "./login.controller";
import {RegisterService} from "./register.service";
import {AuthController} from "./auth.controller";
import {ConfigService} from "@nestjs/config";
import {LoginService} from "./login.service";
import {AuthService} from "./auth.service";
import {JwtModule} from "@nestjs/jwt";
import {Module} from "@nestjs/common";
import {OidcController} from "./oidc.controller";
import {DiscordStrategy} from "./strategies/oidc/discord.strategy";

@Module({
    controllers: [LoginController, RegisterController, AuthController, OidcController],
    providers: [JwtStrategy, AuthJwtStrategy, LoginService, RegisterService, AuthService, DiscordStrategy],
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
