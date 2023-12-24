import {Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {EncryptionModule} from "../encryption/encryption.module";
import {PrismaModule} from "../prisma/prisma.module";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
    imports: [EncryptionModule, PrismaModule]
})
export class UsersModule{}
