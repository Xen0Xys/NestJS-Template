import {PasskeyService} from "./passkey.service";
import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";
import {Global, Module} from "@nestjs/common";
import {TotpService} from "./totp.service";

@Global()
@Module({
    providers: [
        CipherService,
        PrismaService,
        TotpService,
        PasskeyService,
    ],
    exports: [
        CipherService,
        PrismaService,
        TotpService,
        PasskeyService,
    ],
})
export class HelperModule{}
