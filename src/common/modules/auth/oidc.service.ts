import {UsersService} from "../../../modules/users/users.service";
import {UserEntity} from "./models/entities/user.entity";
import {PrismaService} from "../helper/prisma.service";
import {RegisterService} from "./register.service";
import {Providers, Users} from "@prisma/client";
import {Injectable} from "@nestjs/common";
import * as querystring from "node:querystring";
import {CipherService} from "../helper/cipher.service";

@Injectable()
export class OidcService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly registerService: RegisterService,
        private readonly usersService: UsersService,
        private readonly cipherService: CipherService,
    ){}

    async registerOrLogin(provider: Providers, email: string, username: string): Promise<UserEntity>{
        // Email is provider email, maybe not user email
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                email,
                provider,
            },
        });
        // If this provider account is not linked to local account, register it
        if(!user){
            await this.registerService.registerWithProvider(email, username, provider);
            return await this.usersService.getUserByEmail(email);
        }
        return await this.usersService.getUserById(user.id);
    }

    getDiscordUrl(): string{
        return "https://discord.com/api/oauth2/authorize?"
          + querystring.stringify({
              response_type: "code",
              client_id: process.env.DISCORD_CLIENT_ID,
              scope: "identify email",
              redirect_uri: `${process.env.BACKEND_URL}/auth/oidc/callback/discord`,
          });
    }

    getSpotifyUrl(): string{
        return "https://accounts.spotify.com/authorize?"
          + querystring.stringify({
              response_type: "code",
              client_id: process.env.SPOTIFY_CLIENT_ID,
              scope: "user-read-email",
              redirect_uri: `${process.env.BACKEND_URL}/auth/oidc/callback/spotify`,
          });
    }
}
