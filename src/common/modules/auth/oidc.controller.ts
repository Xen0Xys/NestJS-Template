import {Controller, Get, UseGuards} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";

@Controller("auth/oidc")
@ApiTags("Auth")
export class OidcController{
    constructor(

    ){}

    @Get("providers")
    getProviders(){
        return [
            "https://discord.com/oauth2/authorize?client_id=1339952373480558763&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fcallback%2Fdiscord&scope=email+identify",
        ];
    }

    @Get("callback/discord")
    @UseGuards(AuthGuard("discord"))
    discordCallback(){
        return "Discord callback";
    }
}
