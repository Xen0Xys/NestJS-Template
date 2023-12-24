import {Injectable} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class UsersService{

    constructor(private prismaService: PrismaService){}

    findOne(id: number){
        return this.prismaService.user.findUnique({where: {id: id}});
    }

    getUserByUsername(username: string){
        return this.prismaService.user.findUnique({where: {username: username}});
    }
}
