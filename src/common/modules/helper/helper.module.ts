import {CipherService} from "./cipher.service";
import {PrismaService} from "./prisma.service";
import {Global, Module} from "@nestjs/common";
import {JwtService} from "./jwt.service";

@Global()
@Module({
    providers: [
        CipherService,
        JwtService,
        PrismaService,
    ],
    exports: [
        CipherService,
        JwtService,
        PrismaService,
    ],
})
export class HelperModule{}
