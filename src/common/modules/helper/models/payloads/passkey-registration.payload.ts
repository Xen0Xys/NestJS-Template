import {VerifiedRegistrationResponse} from "@simplewebauthn/server";

export class PasskeyRegistrationPayload{
    verification: VerifiedRegistrationResponse;
    options: PublicKeyCredentialCreationOptionsJSON;
}
