import {Injectable, Logger, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {UserEntity} from "./models/entities/user.entity";
import {CipherService} from "../helper/cipher.service";
import {PrismaService} from "../helper/prisma.service";
import {AuthTypes, Passkeys, TwoFactorAuth} from "@prisma/client";
import {JwtScope} from "./models/enums/jwt-scope";
import {JwtService} from "@nestjs/jwt";
import {UsersService} from "../../../modules/users/users.service";
import {EmailsService} from "../emails/emails.service";
import {TotpService} from "../helper/totp.service";
import {PasskeyService} from "../helper/passkey.service";
import type {AuthenticationResponseJSON} from "@simplewebauthn/server";

@Injectable()
export class LoginService{
    private readonly logger: Logger = new Logger(LoginService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly emailsService: EmailsService,
        private readonly totpService: TotpService,
        private readonly passkeyService: PasskeyService,
    ){}

    async validateUser(email: string, password: string): Promise<UserEntity>{
        const user: UserEntity = await this.usersService.getUserByEmail(email);
        if(!user.password){
            this.logger.debug(`Failed validation for user with id ${user.id} (Invalid provider)`);
            throw new UnauthorizedException(`Please use provider ${user.provider} to login`);
        }
        if(!this.cipherService.comparePassword(password, user.password)){
            this.logger.debug(`Failed validation for user with id ${user.id} (Invalid password)`);
            throw new UnauthorizedException("Invalid password");
        }
        this.logger.debug(`Validated user with id ${user.id}`);
        return user;
    }

    async getUserAuthType(userId: string): Promise<AuthTypes>{
        const user = await this.prismaService.users.findUnique({
            where: {
                id: userId,
            },
            include: {
                passkeys: true,
                two_factor_auth: {
                    where: {
                        enabled: true,
                    },
                },
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        if(user.passkeys.length > 0)
            return AuthTypes.PASSKEY;
        if(user.two_factor_auth && user.two_factor_auth.enabled)
            return AuthTypes.TWO_FACTOR;
        return AuthTypes.PASSWORD;
    }

    async isUserVerified(userId: string): Promise<boolean>{
        const user: UserEntity = await this.usersService.getUserById(userId);
        return user.verified;
    }

    generateToken(userId: string, userTokenId: string, scope: JwtScope): string{
        this.logger.debug(`Issuing token for user with id ${userId} with scope ${scope}`);
        return this.jwtService.sign({
            scope,
        }, {
            subject: userId,
            expiresIn: scope !== JwtScope.USAGE ? "5m" : "7d",
            jwtid: userTokenId,
        });
    }

    async sendMagicLink(email: string): Promise<void>{
        const user: UserEntity = await this.usersService.getUserByEmail(email);
        if(!user)
            throw new NotFoundException("User not found");
        if(!user.verified)
            throw new UnauthorizedException("User is not verified and cannot use magic link login");
        const token: string = this.generateToken(user.id, user.tokenId, JwtScope.MAGIC);
        await this.emailsService.sendMagicLink(email, token);
    }

    async validate2fa(user: UserEntity, code: string): Promise<boolean>{
        const totp: TwoFactorAuth = await this.prismaService.twoFactorAuth.findUnique({
            where: {
                user_id: user.id,
                enabled: true,
            },
        });
        if(!totp)
            throw new NotFoundException("2FA not enabled for user");
        if(!this.totpService.verifyTotp(code, totp.secret))
            throw new UnauthorizedException("Invalid 2FA code");
        return true;
    }

    async requestPasskeyLogin(user: UserEntity): Promise<PublicKeyCredentialRequestOptionsJSON>{
        const passkeys: Passkeys[] = await this.prismaService.passkeys.findMany({
            where: {
                user_id: user.id,
            },
        });
        return await this.passkeyService.generateAuthenticationChallenge(user, passkeys);
    }

    async validatePasskeyLogin(user: UserEntity, response: AuthenticationResponseJSON): Promise<boolean>{
        const passkey: Passkeys = await this.prismaService.passkeys.findFirst({
            where: {
                user_id: user.id,
                webauthn_user_id: response.response.userHandle,
            },
        });
        if(!passkey)
            throw new NotFoundException("Passkey not found");
        await this.passkeyService.verifyAuthenticationChallenge(user, passkey, response);
        await this.prismaService.passkeys.update({
            where: {
                id: passkey.id,
            },
            data: {
                last_used_at: new Date(),
            },
        });
        return true;
    }
}
