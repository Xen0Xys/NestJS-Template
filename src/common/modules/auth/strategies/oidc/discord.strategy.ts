import {UserEntity} from "../../models/entities/user.entity";
import {PassportStrategy} from "@nestjs/passport";
import {OidcService} from "../../oidc.service";
import {Injectable} from "@nestjs/common";
import {Strategy} from "passport-discord";
import {Providers} from "@prisma/client";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord"){
    constructor(
        private readonly oidcService: OidcService,
    ){
        super({
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL}/auth/oidc/callback/discord`,
            scope: ["identify", "email"],
        });
    }

    async validate(_: string, __: string, profile: any): Promise<UserEntity>{
        return await this.oidcService.registerOrLogin(Providers.DISCORD, profile.email, profile.global_name);
    }
}
