import {Controller, Get, NotFoundException, Res, UseGuards} from "@nestjs/common";
import {UserEntity} from "./models/entities/user.entity";
import {JwtScope} from "./models/enums/jwt-scope";
import {User} from "./decorators/user.decorator";
import {LoginService} from "./login.service";
import {OidcService} from "./oidc.service";
import {AuthGuard} from "@nestjs/passport";
import {type FastifyReply} from "fastify";
import {Providers} from "@prisma/client";
import {ApiTags} from "@nestjs/swagger";

@Controller("auth/oidc")
@ApiTags("Auth")
export class OidcController{
    constructor(
        private readonly loginService: LoginService,
        private readonly oidcService: OidcService,
    ){}

    @Get("providers")
    getProviders(): Record<string, string>{
        const providers: Record<string, string> = {};
        if(process.env.DISCORD_CLIENT_ID)
            providers[Providers.DISCORD] = this.oidcService.getDiscordUrl();
        if(process.env.SPOTIFY_CLIENT_ID)
            providers[Providers.SPOTIFY] = this.oidcService.getSpotifyUrl();
        return providers;
    }

    @Get("discord")
    redirectToDiscord(@Res() res: FastifyReply){
        if(!process.env.DISCORD_CLIENT_ID)
            throw new NotFoundException("Discord provider not configured");
        res.redirect(this.oidcService.getDiscordUrl(), 302);
    }

    @Get("spotify")
    redirectToSpotify(@Res() res: FastifyReply){
        if(!process.env.SPOTIFY_CLIENT_ID)
            throw new NotFoundException("Spotify provider not configured");
        res.redirect(this.oidcService.getSpotifyUrl(), 302);
    }

    @Get("callback/discord")
    @UseGuards(AuthGuard("discord"))
    discordCallback(@User() user: UserEntity, @Res() res: FastifyReply){
        const token: string = this.loginService.generateToken(
            user.id,
            user.tokenId,
            JwtScope.USAGE,
        );
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`, 302);
    }

    @Get("callback/spotify")
    @UseGuards(AuthGuard("spotify"))
    spotifyCallback(@User() user: UserEntity, @Res() res: FastifyReply){
        const token: string = this.loginService.generateToken(
            user.id,
            user.tokenId,
            JwtScope.USAGE,
        );
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`, 302);
    }
}
