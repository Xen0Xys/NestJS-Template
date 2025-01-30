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
    ],
    exports: [
        CipherService,
        PrismaService,
        TotpService,
    ],
})
export class HelperModule{}
