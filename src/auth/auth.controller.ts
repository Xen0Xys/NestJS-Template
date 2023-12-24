import {Body, Controller, HttpStatus, Post, Res} from "@nestjs/common";
import {EncryptionService} from "../encryption/encryption.service";
import {TokenResponseModel} from "./models/token-response.model";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {UsersService} from "../users/users.service";
import {LoginUserDto} from "./dto/login-user.dto";
import {AuthService} from "./auth.service";
import {FastifyReply} from "fastify";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController{
    constructor(private usersService: UsersService, private encryptionService: EncryptionService, private authService: AuthService){}

    @Post("login")
    @ApiResponse({status: HttpStatus.OK, type: TokenResponseModel})
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: "User not found"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Invalid password"})
    async login(@Res() res: FastifyReply, @Body() loginUserDto: LoginUserDto){
        const user = await this.usersService.getUserByUsername(loginUserDto.username);
        if(!user)
            return res.status(HttpStatus.NOT_FOUND).send({message: "User not found"});
        if(!await this.encryptionService.comparePassword(user.password, loginUserDto.password))
            return res.status(HttpStatus.UNAUTHORIZED).send({message: "Invalid password"});
        return res.status(HttpStatus.OK).send(new TokenResponseModel(this.authService.getToken(user.id)));
    }
}
