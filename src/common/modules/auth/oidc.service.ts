import {UsersService} from "../../../modules/users/users.service";
import {Providers, RegisteredProviders} from "@prisma/client";
import {ConflictException, Injectable} from "@nestjs/common";
import {UserEntity} from "./models/entities/user.entity";
import {PrismaService} from "../helper/prisma.service";
import {RegisterService} from "./register.service";

@Injectable()
export class OidcService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly registerService: RegisterService,
        private readonly usersService: UsersService,
    ){}

    async registerOrLogin(provider: Providers, email: string, username: string): Promise<UserEntity>{
        // Email is provider email, maybe not user email
        let registeredProvider: RegisteredProviders = await this.prismaService.registeredProviders.findFirst({
            where: {
                email,
                provider,
            },
        });
        // If this provider account is not linked to local account, register it
        if(!registeredProvider){
            await this.registerService.registerWithProvider(email, username);
            const user: UserEntity = await this.usersService.getUserByEmail(email);
            await this.prismaService.registeredProviders.create({
                data: {
                    user_id: user.id,
                    email,
                    provider,
                },
            });
            return user;
        }
        return await this.usersService.getUserById(registeredProvider.user_id);
    }

    async registerProvider(user: UserEntity, provider: Providers, email: string): Promise<void>{
        const registeredProvider: RegisteredProviders = await this.prismaService.registeredProviders.findFirst({
            where: {
                user_id: user.id,
                provider,
            },
        });
        if(registeredProvider)
            throw new ConflictException("User has already registered this provider");
        await this.prismaService.registeredProviders.create({
            data: {
                user_id: user.id,
                email,
                provider,
            },
        });
    }
}
