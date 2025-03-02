import {PublicPasskeyEntity} from "./models/entities/public-passkey.entity";
import {UserEntity} from "./models/entities/user.entity";
import {Passkeys, TwoFactorAuth} from "@prisma/client";
import {CipherService} from "../helper/cipher.service";
import {PrismaService} from "../helper/prisma.service";
import {Injectable, UnauthorizedException} from "@nestjs/common";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

    async updatePassword(user: UserEntity, newPassword: string, currentPassword?: string): Promise<void>{
        // Check if current password is equal to the user's password
        if(user.password){
            if(!currentPassword)
                throw new UnauthorizedException("Passwords do not match");
            const valid: boolean = this.cipherService.comparePassword(currentPassword, user.password);
            if(!valid)
                throw new UnauthorizedException("Invalid password");
        }
        // Update the user's password
        await this.prismaService.users.update({
            where: {
                id: user.id,
            },
            data: {
                password: this.cipherService.hashPassword(newPassword),
            },
        });
    }

    async is2faEnabled(user: UserEntity): Promise<boolean>{
        const twoFactorAuth: TwoFactorAuth = await this.prismaService.twoFactorAuth.findUnique({
            where: {
                user_id: user.id,
                enabled: true,
            },
        });
        return twoFactorAuth !== null;
    }

    async disableTwoFactorAuth(user: UserEntity): Promise<void>{
        await this.prismaService.twoFactorAuth.delete({
            where: {
                user_id: user.id,
            },
        });
    }

    async deletePasskey(user: UserEntity, passkeyId: string): Promise<void>{
        await this.prismaService.passkeys.delete({
            where: {
                id: passkeyId,
                user_id: user.id,
            },
        });
    }

    async getPasskeys(user: UserEntity): Promise<PublicPasskeyEntity[]>{
        const passkeys: Passkeys[] = await this.prismaService.passkeys.findMany({
            where: {
                user_id: user.id,
            },
        });
        return passkeys.map((passkey: Passkeys): PublicPasskeyEntity => {
            return {
                id: passkey.id,
                lastUsed: passkey.last_used_at,
            } as PublicPasskeyEntity;
        });
    }

    async invalidateTokens(user: UserEntity): Promise<void>{
        await this.prismaService.users.update({
            where: {
                id: user.id,
            },
            data: {
                token_id: this.cipherService.generateRandomBytes(),
            },
        });
    }
}
