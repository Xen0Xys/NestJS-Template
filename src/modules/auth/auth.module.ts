import {ServicesModule} from "../../common/services/services.module";
import {UsersModule} from "../users/users.module";
import {AuthController} from "./auth.controller";
import {AuthGuard} from "./guards/auth.guard";
import {AuthService} from "./auth.service";
import {Module} from "@nestjs/common";

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    imports: [UsersModule, ServicesModule],
    exports: [AuthGuard, UsersModule]
})
export class AuthModule{}
