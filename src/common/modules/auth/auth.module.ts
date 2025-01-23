import {LocalStrategy} from "./strategies/local.strategy";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {Module} from "@nestjs/common";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {JwtModule} from "@nestjs/jwt";

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    imports: [
        JwtModule.register({
            secret: process.env.APP_KEY,
            signOptions: {
                expiresIn: "7d",
                algorithm: "HS512",
                issuer: process.env.APP_NAME,
            },
            verifyOptions: {
                algorithms: ["HS512"],
                issuer: process.env.APP_NAME,
            },
        }),
    ],
})
export class AuthModule{}
