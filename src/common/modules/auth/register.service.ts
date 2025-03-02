import {ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../helper/prisma.service";
import {CipherService} from "../helper/cipher.service";
import type {EmailVerifications, Passkeys, Providers, TwoFactorAuth, Users} from "@prisma/client";
import {EmailsService} from "../emails/emails.service";
import {TotpService} from "../helper/totp.service";
import {UserEntity} from "./models/entities/user.entity";
import {TotpRegisterPayload} from "./models/payloads/totp-register.payload";
import type {RegistrationResponseJSON} from "@simplewebauthn/server";
import {PasskeyService} from "../helper/passkey.service";
import {PasskeyRegistrationPayload} from "../helper/models/payloads/passkey-registration.payload";

@Injectable()
export class RegisterService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly emailsService: EmailsService,
        private readonly totpService: TotpService,
        private readonly passkeyService: PasskeyService,
    ){}

    async register(email: string, username: string, password?: string): Promise<void>{
        const emailExists: Users = await this.prismaService.users.findFirst({
            where: {
                email,
            },
        });
        if(emailExists)
            throw new ConflictException("Email already registered");
        const hashedPassword: string = password ? this.cipherService.hashPassword(password) : undefined;
        const user: Users = await this.prismaService.users.create({
            data: {
                id: Bun.randomUUIDv7(),
                email,
                username,
                password: hashedPassword,
                token_id: this.cipherService.generateRandomBytes(),
            },
        });
        const emailVerification: EmailVerifications = await this.prismaService.emailVerifications.create({
            data: {
                id: Bun.randomUUIDv7(),
                user_id: user.id,
            },
        });
        await this.emailsService.sendEmailVerification(email, emailVerification.id);
    }

    async registerWithProvider(email: string, username: string, provider: Providers){
        const emailExists: Users = await this.prismaService.users.findFirst({
            where: {
                email,
            },
        });
        if(emailExists)
            throw new ConflictException("This email is already used by a user, please use another provider account");
        await this.prismaService.users.create({
            data: {
                id: Bun.randomUUIDv7(),
                email,
                username,
                provider,
                token_id: this.cipherService.generateRandomBytes(),
            },
        });
    }

    async verifyEmail(token: string): Promise<void>{
        const emailVerification = await this.prismaService.emailVerifications.findUnique({
            where: {
                id: token,
            },
            include: {
                user: true,
            },
        });
        if(!emailVerification)
            throw new ConflictException("Invalid token");
        await this.prismaService.emailVerifications.delete({
            where: {
                id: token,
            },
        });
        // Check if token expired (24 hours)
        if(emailVerification.created_at.getTime() + 1000 * 60 * 60 * 24 < Date.now()){
            const newEmailVerification: EmailVerifications = await this.prismaService.emailVerifications.create({
                data: {
                    id: Bun.randomUUIDv7(),
                    user_id: emailVerification.user_id,
                },
            });
            await this.emailsService.sendEmailVerification(emailVerification.user.email, newEmailVerification.id);
            throw new ConflictException("Token expired, new token sent");
        }
    }

    async generate2FaSecret(user: UserEntity): Promise<TotpRegisterPayload>{
        let totp: TwoFactorAuth = await this.prismaService.twoFactorAuth.findUnique({
            where: {
                user_id: user.id,
            },
        });
        if(totp && totp.enabled)
            throw new ConflictException("2FA already enabled");
        if(totp)
            // Delete existing 2FA
            await this.prismaService.twoFactorAuth.delete({
                where: {
                    user_id: user.id,
                },
            });
        // Recreate 2FA
        totp = await this.prismaService.twoFactorAuth.create({
            data: {
                user_id: user.id,
                secret: this.totpService.generateSecret(),
                enabled: false,
            },
        });
        return {
            secret: totp.secret,
            qr: await this.totpService.generateTotpQrCode(user.id, totp.secret),
        } as TotpRegisterPayload;
    }

    async validate2Fa(user: UserEntity, code: string): Promise<void>{
        const totp: TwoFactorAuth = await this.prismaService.twoFactorAuth.findFirst({
            where: {
                user_id: user.id,
            },
        });
        if(!totp)
            throw new ConflictException("2FA not enabled");
        if(!this.totpService.verifyTotp(code, totp.secret))
            throw new ConflictException("Invalid token");
        await this.prismaService.twoFactorAuth.update({
            data: {
                enabled: true,
            },
            where: {
                user_id: user.id,
            },
        });
    }

    async registerPasskey(user: UserEntity): Promise<PublicKeyCredentialCreationOptionsJSON>{
        const passkeys: Passkeys[] = await this.prismaService.passkeys.findMany({
            where: {
                user_id: user.id,
            },
        });
        if(passkeys.length >= 5)
            throw new ConflictException("Max passkeys reached");
        return this.passkeyService.generateRegistrationChallenge(user, passkeys);
    }

    async validatePasskey(user: UserEntity, response: RegistrationResponseJSON): Promise<void>{
        const passkeys: Passkeys[] = await this.prismaService.passkeys.findMany({
            where: {
                user_id: user.id,
            },
        });
        if(passkeys.length >= 5)
            throw new ConflictException("Max passkeys reached");
        const result: PasskeyRegistrationPayload = await this.passkeyService.verifyRegistrationChallenge(user, response);
        if(!result.verification.verified)
            throw new UnauthorizedException("Invalid passkey");
        await this.prismaService.passkeys.create({
            data: {
                id: result.verification.registrationInfo.credential.id,
                user_id: user.id,
                counter: result.verification.registrationInfo.credential.counter,
                backed_up: result.verification.registrationInfo.credentialBackedUp,
                device_type: result.verification.registrationInfo.credentialDeviceType,
                public_key: result.verification.registrationInfo.credential.publicKey,
                transports: result.verification.registrationInfo.credential.transports,
                webauthn_user_id: result.options.user.id,
            },
        });
    }
}
