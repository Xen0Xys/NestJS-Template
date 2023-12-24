import {Controller, Get, Req, Res, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../auth/guards/auth.guard";
import {UsersService} from "./users.service";
import {UserEntity} from "./entities/user.entity";
import {FastifyReply} from "fastify";

@Controller("users")
@ApiTags("Users")
export class UsersController{
    constructor(private readonly usersService: UsersService){}

    @Get("self")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiResponse({status: 200, description: "Get self", type: UserEntity})
    @ApiResponse({status: 404, description: "User not found"})
    async findSelf(@Req() req: any, @Res() res: FastifyReply): Promise<UserEntity>{
        const user = await this.usersService.findOne(req.user.id);
        if(!user)
            return res.status(404).send({message: "User not found"});
        delete user.password;
        return res.status(200).send(user);
    }
}
