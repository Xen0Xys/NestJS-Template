import {Injectable} from "@nestjs/common";
import * as qrcode from "qrcode";
import {authenticator} from "otplib";

@Injectable()
export class TotpService{
    generateSecret(){
        return authenticator.generateSecret();
    }

    async generateTotpQrCode(userId: string, secret: string): Promise<string>{
        const totpUri: string = authenticator.keyuri(userId, process.env.APP_NAME, secret);
        return await qrcode.toDataURL(totpUri);
    }

    verifyTotp(code: string, secret: string): boolean{
        return authenticator.check(code, secret);
    }
}
