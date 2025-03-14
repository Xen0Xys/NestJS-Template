import {Injectable, NotFoundException} from "@nestjs/common";
import {UserEntity} from "../../common/modules/auth/models/entities/user.entity";
import {PrismaService} from "../../common/modules/helper/prisma.service";
import {StorageService} from "../../common/modules/storage/storage.service";
import {FilesService} from "../../common/modules/storage/files.service";

@Injectable()
export class UsersService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly filesService: FilesService,
        private readonly storageService: StorageService,
    ){}

    async getUserById(id: string): Promise<UserEntity>{
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
            provider: user.provider,
            tokenId: user.token_id,
            avatarId: user.avatar_id,
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
            provider: user.provider,
            tokenId: user.token_id,
            avatarId: user.avatar_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        });
    }

    async setAvatar(user: UserEntity, image: Buffer){
        const previousSum: string = user.avatarId;
        const sum: string = await this.storageService.uploadBuffer(await this.filesService.toAvatar(image));
        await this.prismaService.users.update({
            where: {
                id: user.id,
            },
            data: {
                avatar_id: sum,
            },
        });
        if(previousSum)
            try{
                await this.storageService.deleteFile(previousSum);
            }catch(_: any){}
    }
}
