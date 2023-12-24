import {Module} from "@nestjs/common";
import {AuthModule} from "./auth/auth.module";
import {UsersModule} from "./users/users.module";
import {EncryptionModule} from "./encryption/encryption.module";
import {PrismaModule} from "./prisma/prisma.module";

@Module({
    imports: [UsersModule, AuthModule, EncryptionModule, PrismaModule],
})
export class AppModule{}
