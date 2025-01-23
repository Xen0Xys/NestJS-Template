import {Body, Controller, Post, Request, UseGuards} from "@nestjs/common";
import {LoginDto} from "./models/dto/login.dto";
import {ApiBearerAuth} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
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
    @UseGuards(AuthGuard("local"))
    @ApiBearerAuth()
    login(@Request() req: any, @Body() _body: LoginDto){
        return {
            user: req.user,
            token: this.authService.generateJwt(req.user),
        };
    }
}
