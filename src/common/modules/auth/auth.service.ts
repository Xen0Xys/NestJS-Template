import {PublicPasskeyEntity} from "./models/entities/public-passkey.entity";
import {UserEntity} from "./models/entities/user.entity";
import {Passkeys, TwoFactorAuth} from "@prisma/client";
import {CipherService} from "../helper/cipher.service";
import {PrismaService} from "../helper/prisma.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){}

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
