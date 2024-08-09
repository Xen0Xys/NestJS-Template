import {UsersModule} from "../users/users.module";
import {AuthController} from "./auth.controller";
import {AuthGuard} from "./guards/auth.guard";
import {AuthService} from "./auth.service";
import {Module} from "@nestjs/common";
import {JwtService} from "../services/jwt.service";
import {CipherService} from "../services/cipher.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, CipherService, JwtService],
    imports: [UsersModule],
    exports: [AuthGuard]
})
export class AuthModule{}
