import {Injectable, NotFoundException} from "@nestjs/common";
import {UserEntity} from "../../common/modules/auth/models/entities/user.entity";
import {PrismaService} from "../../common/modules/helper/prisma.service";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async getUserById(id: string){
        const user = await this.prismaService.users.findUnique({
            where: {
                id,
            },
            include: {
                email_verifications: true,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        return new UserEntity({
            id: user.id,
            username: user.username,
            email: user.email,
            verified: !user.email_verifications,
            password: user.password,
            tokenId: user.token_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    }

    async getUserByEmail(email: string): Promise<UserEntity>{
        const user = await this.prismaService.users.findUnique({
            where: {
                email,
            },
            include: {
                email_verifications: true,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        return new UserEntity({
            id: user.id,
            username: user.username,
            email: user.email,
            verified: !user.email_verifications,
            password: user.password,
            tokenId: user.token_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    }
}
