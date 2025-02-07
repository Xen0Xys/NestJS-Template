import {Controller, Get, UseGuards} from "@nestjs/common";
import {JwtAuthGuard} from "../../common/modules/auth/guards/jwt-auth.guard";
import {UserEntity} from "../../common/modules/auth/models/entities/user.entity";
import {ApiBearerAuth} from "@nestjs/swagger";
import {User} from "src/common/modules/auth/decorators/user.decorator";

@Controller("users")
export class UsersController{
    constructor(){}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getMyself(@User() user: UserEntity): UserEntity{
        return user;
    }
}
