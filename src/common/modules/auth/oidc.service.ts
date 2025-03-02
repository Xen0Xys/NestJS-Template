import {UsersService} from "../../../modules/users/users.service";
import {UserEntity} from "./models/entities/user.entity";
import {PrismaService} from "../helper/prisma.service";
import {RegisterService} from "./register.service";
import {Providers, Users} from "@prisma/client";
import {Injectable} from "@nestjs/common";

@Injectable()
export class OidcService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly registerService: RegisterService,
        private readonly usersService: UsersService,
    ){}

    async registerOrLogin(provider: Providers, email: string, username: string): Promise<UserEntity>{
        // Email is provider email, maybe not user email
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                email,
                provider,
            },
        });
        // If this provider account is not linked to local account, register it
        if(!user){
            await this.registerService.registerWithProvider(email, username, provider);
            return await this.usersService.getUserByEmail(email);
        }
        return await this.usersService.getUserById(user.id);
    }
}
