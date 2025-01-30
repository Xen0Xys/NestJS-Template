import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../../common/modules/auth/guards/jwt-auth.guard";
import {UserEntity} from "../../common/modules/auth/models/entities/user.entity";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller("users")
export class UsersController{
    constructor(){}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getMyself(@Req() req: any): UserEntity{
        return req.user;
    }
}
