import {PrismaService} from "../../common/services/prisma.service";
import {UserEntity} from "./entities/user.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UsersService{
    constructor(
        private prismaService: PrismaService,
    ){}

    findOne(id: number): Promise<UserEntity>{
        return this.prismaService.user.findUnique({where: {id: id}});
    }

    getUserByUsername(username: string): Promise<UserEntity>{
        return this.prismaService.user.findUnique({where: {username: username}});
    }
}
