import type {AuthenticatedRequest} from "./models/models/authenticated-request";
import {Body, Controller, Get, Post, Req, Res, UseGuards} from "@nestjs/common";
import {LoginResponse} from "./responses/login.response";
import {AuthService} from "./auth.service";
import {EmailsService} from "../emails/emails.service";
import {AuthGuard} from "@nestjs/passport";
import {MagicLinkLoginDto} from "./models/dto/magic-link-login.dto";
import {LocalLoginDto} from "./models/dto/local-login.dto";
import {MagicLinkStrategy} from "./strategies/magic-link.strategy";
import type {FastifyReply, FastifyRequest} from "fastify";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
        private readonly emailsService: EmailsService,
        private readonly magicLinkStrategy: MagicLinkStrategy,
    ){}

    @Post("login/local")
    @UseGuards(AuthGuard("local"))
    localLogin(@Req() req: AuthenticatedRequest, @Body() _body: LocalLoginDto): LoginResponse{
        return {
            user: req.user,
            token: this.authService.generateJwt(req.user),
        };
    }

    @Post("login/magic")
    async magicLinkLogin(@Req() req: FastifyRequest, @Res() res: FastifyReply, @Body() body: MagicLinkLoginDto): Promise<void>{
        await this.authService.getUserByEmail(body.destination);
        this.magicLinkStrategy.send(req as any, {
            ...res,
            status: (code: number) => {
                res.statusCode = code;
                return res;
            },
            json: res.send.bind(res),
        } as any);
    }

    @Get("login/magic/callback")
    @UseGuards(AuthGuard("magiclink"))
    async magicLinkCallback(@Req() req: AuthenticatedRequest, @Body() _body: MagicLinkLoginDto): Promise<LoginResponse>{
        return {
            user: req.user,
            token: this.authService.generateJwt(req.user),
        };
    }
}
