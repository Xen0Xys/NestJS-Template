import {PassportStrategy} from "@nestjs/passport";
import {Injectable} from "@nestjs/common";
import {Strategy} from "passport-discord";
import {OidcService} from "../../oidc.service";
import {Providers} from "@prisma/client";
import {UserEntity} from "../../models/entities/user.entity";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord"){
    constructor(
        private readonly oidcService: OidcService,
    ){
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/oidc/callback/discord",
            scope: ["identify", "email"],
        });
    }

    async validate(_: string, __: string, profile: any): Promise<UserEntity>{
        return await this.oidcService.registerOrLogin(Providers.DISCORD, profile.email, profile.global_name);
    }
}
