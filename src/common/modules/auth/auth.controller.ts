import type {AuthenticatedRequest} from "./models/models/authenticated-request";
import {Body, Controller, Post, Request, UseGuards} from "@nestjs/common";
import {LoginResponse} from "./responses/login.response";
import {LoginGuard} from "./guards/login.guard";
import {LoginDto} from "./models/dto/login.dto";
import {ApiBearerAuth} from "@nestjs/swagger";
import {AuthService} from "./auth.service";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
    ){}

    @Post("register")
    register(){
        return "Register";
    }

    @Post("login")
    @UseGuards(LoginGuard)
    @ApiBearerAuth()
    login(@Request() req: AuthenticatedRequest, @Body() _body: LoginDto): LoginResponse{
        return {
            user: req.user,
            token: this.authService.generateJwt(req.user),
        };
    }
}
