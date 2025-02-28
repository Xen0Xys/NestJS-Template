import {Controller, Get, UseGuards} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {User} from "./decorators/user.decorator";
import {UserEntity} from "./models/entities/user.entity";

@Controller("auth/oidc")
@ApiTags("Auth")
export class OidcController{
    constructor(

    ){}

    @Get("providers")
    getProviders(): string[]{
        return [
            process.env.DISCORD_CLIENT_URL,
        ];
    }

    @Get("callback/discord")
    @UseGuards(AuthGuard("discord"))
    discordCallback(@User() user: UserEntity){
        // TODO: Generate usage token and redirect to frontend
        return user;
    }
}
