import {PassportStrategy} from "@nestjs/passport";
import {OidcService} from "../../oidc.service";
import {Injectable, Logger} from "@nestjs/common";
import {Providers} from "@prisma/client";
import {Strategy} from "passport";
import {UserEntity} from "../../models/entities/user.entity";

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord"){
    private readonly logger: Logger = new Logger(DiscordStrategy.name);

    constructor(
        private readonly oidcService: OidcService,
    ){
        super();
    }

    async exchangeCode(code: string): Promise<string>{
        const data = new URLSearchParams();
        data.append("grant_type", "authorization_code");
        data.append("code", code);
        data.append("redirect_uri", `${process.env.BACKEND_URL}/auth/oidc/callback/discord`);
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${Buffer.from(`${process.env.DISCORD_CLIENT_ID}:${process.env.DISCORD_CLIENT_SECRET}`).toString("base64")}`,
        };
        let response = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: headers,
            body: data,
        });
        if(!response.ok) throw new Error(`${response.statusText} ${await response.text()}`);
        const {access_token} = await response.json();
        return access_token;
    }

    async fetchUserProfile(accessToken: string){
        const response = await fetch("https://discord.com/api/users/@me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if(!response.ok) throw new Error(`${response.statusText} ${await response.text()}`);
        return response.json();
    }

    async authenticate(req: any){
        const code: string = req.query.code;
        try{
            const accessToken: string | undefined = await this.exchangeCode(code);
            const userProfile: any = await this.fetchUserProfile(accessToken);
            this.success(await this.validate(userProfile));
        }catch(e){
            this.logger.error(e);
            return this.fail({message: "Failed to fetch user profile"}, 401);
        }
    }

    async validate(profile: any): Promise<UserEntity>{
        return await this.oidcService.registerOrLogin(Providers.DISCORD, profile.email, profile.global_name);
    }
}
