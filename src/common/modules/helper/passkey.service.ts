import {Injectable, NotFoundException} from "@nestjs/common";
import {UserEntity} from "../auth/models/entities/user.entity";
import {Passkeys} from "@prisma/client";
import {
    AuthenticationResponseJSON,
    generateAuthenticationOptions,
    generateRegistrationOptions,
    RegistrationResponseJSON,
    VerifiedRegistrationResponse,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from "@simplewebauthn/server";
import {PasskeyRegistrationPayload} from "./models/payloads/passkey-registration.payload";
import {PrismaService} from "./prisma.service";

@Injectable()
export class PasskeyService{
    private readonly registerChallenges: Map<string, PublicKeyCredentialCreationOptionsJSON> = new Map();
    private readonly authenticationChallenges: Map<string, PublicKeyCredentialRequestOptionsJSON> = new Map();
    private readonly RP_ID: string = process.env.REDIRECT_URL.replace("http://", "").replace("https://", "").split(":")[0];

    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async generateRegistrationChallenge(user: UserEntity, existingPasskeys: Passkeys[]): Promise<PublicKeyCredentialCreationOptionsJSON>{
        const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
            rpName: process.env.APP_NAME,
            rpID: this.RP_ID,
            userName: user.username,
            attestationType: "none",
            excludeCredentials: existingPasskeys.map((passkey: Passkeys) => ({
                id: passkey.id,
                transports: passkey.transports as AuthenticatorTransport[],
            })),
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
                authenticatorAttachment: "platform",
            },
        });
        this.registerChallenges.set(user.id, options);
        return options;
    }

    async verifyRegistrationChallenge(user: UserEntity, response: RegistrationResponseJSON): Promise<PasskeyRegistrationPayload>{
        const options: PublicKeyCredentialCreationOptionsJSON = this.registerChallenges.get(user.id);
        if(!options)
            throw new NotFoundException("No challenge found for user");
        const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
            response,
            expectedChallenge: options.challenge,
            expectedOrigin: process.env.REDIRECT_URL,
            expectedRPID: this.RP_ID,
        });
        this.registerChallenges.delete(user.id);
        return {
            verification,
            options,
        } as PasskeyRegistrationPayload;
    }

    async generateAuthenticationChallenge(user: UserEntity, userPasskeys: Passkeys[]): Promise<PublicKeyCredentialRequestOptionsJSON>{
        const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
            rpID: this.RP_ID,
            allowCredentials: userPasskeys.map((passkey: Passkeys) => ({
                id: passkey.id,
                transports: passkey.transports as AuthenticatorTransport[],
            })),
        });
        this.authenticationChallenges.set(user.id, options);
        return options;
    }

    async verifyAuthenticationChallenge(user: UserEntity, response: AuthenticationResponseJSON): Promise<void>{
        const options: PublicKeyCredentialRequestOptionsJSON = this.authenticationChallenges.get(user.id);
        if(!options)
            throw new NotFoundException("No challenge found for user");
        const passkey: Passkeys = await this.prismaService.passkeys.findFirst({
            where: {
                user_id: user.id,
                webauthn_user_id: response.response.userHandle,
            },
        });
        if(!passkey)
            throw new NotFoundException("Passkey not found");
        await verifyAuthenticationResponse({
            response,
            expectedChallenge: options.challenge,
            expectedOrigin: process.env.REDIRECT_URL,
            expectedRPID: this.RP_ID,
            credential: {
                id: passkey.id,
                publicKey: passkey.public_key,
                counter: passkey.counter,
                transports: passkey.transports as AuthenticatorTransport[],
            },
        });
        this.authenticationChallenges.delete(user.id);
    }
}
