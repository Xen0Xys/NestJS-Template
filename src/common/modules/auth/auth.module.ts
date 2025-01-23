import {LocalStrategy} from "./strategies/local.strategy";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {Module} from "@nestjs/common";

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy],
})
export class AuthModule{}
