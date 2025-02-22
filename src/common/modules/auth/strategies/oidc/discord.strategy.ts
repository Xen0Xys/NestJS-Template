import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {OAuth2Strategy} from "passport-oauth";

@Injectable()
export class DiscordStrategy extends PassportStrategy(OAuth2Strategy, "discord"){
    constructor(){
        super(
            {
                authorizationURL: "https://discord.com/oauth2/authorize",
                tokenURL: "https://discord.com/api/oauth2/token",
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: "http://localhost:4000/auth/oidc/callback/discord",
                scope: ["identify", "email"],
            },
            function(accessToken: any, refreshToken: any, profile: any, cb: any): any{
                console.log("Access token", accessToken);
                console.log("Refresh token", refreshToken);
                console.log("Profile", profile);
                return cb(null, profile);
            },
        );
    }
}
