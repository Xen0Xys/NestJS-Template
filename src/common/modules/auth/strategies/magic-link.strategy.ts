import {UserEntity} from "../models/entities/user.entity";
import {PassportStrategy} from "@nestjs/passport";
import {AuthService} from "../auth.service";
import Strategy from "passport-magic-login";
import {Injectable} from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class MagicLinkStrategy extends PassportStrategy(Strategy as any, "magiclink"){
    constructor(
        private readonly authService: AuthService,
    ){
        super({
            secret: process.env.APP_KEY,
            jwtOptions: {
                expiresIn: "5m",
            },
            callbackUrl: "http://localhost:4000/auth/login/magic/callback",
            async sendMagicLink(email: string, callbackUrl: string): Promise<void>{
                console.log(email, callbackUrl);
            },
            verify: async(payload: any, verifyCallback: any) => {
                verifyCallback(null, await this.validate(payload));
            },
        });
    }

    async validate(payload: any): Promise<UserEntity>{
        return new UserEntity(await this.authService.getUserByEmail(payload.destination));
    }
}
