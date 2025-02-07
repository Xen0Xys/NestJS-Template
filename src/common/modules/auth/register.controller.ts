import {Body, Controller, HttpCode, Post, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {RegisterDto} from "./models/dto/register.dto";
import {RegisterService} from "./register.service";
import {ConfirmEmailDto} from "./models/dto/confirm-email.dto";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {TotpRegisterPayload} from "./models/payloads/totp-register.payload";
import {TotpDto} from "./models/dto/totp.dto";
import type {RegistrationResponseJSON} from "@simplewebauthn/server";
import {User} from "./decorators/user.decorator";
import {UserEntity} from "./models/entities/user.entity";

@Controller("auth/register")
@ApiTags("Auth")
export class RegisterController{
    constructor(
        private readonly registerService: RegisterService,
    ){}

    /**
     * Registers a new user
     *
     * @throws {400} Bad request
     * @throws {409} Email already used
     * @throws {500} Internal server error
     */
    @Post("")
    @HttpCode(204)
    async register(@Body() body: RegisterDto): Promise<void>{
        await this.registerService.register(body.email, body.username, body.password);
    }

    /**
     * Confirms the user's email
     *
     * @throws {400} Bad request
     * @throws {404} Token not found
     * @throws {500} Internal server error
     */
    @Post("confirm")
    @HttpCode(204)
    async confirmEmail(@Body() body: ConfirmEmailDto): Promise<void>{
        await this.registerService.verifyEmail(body.code);
    }

    @Post("passkey")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async registerPasskey(@User() user: UserEntity): Promise<PublicKeyCredentialCreationOptionsJSON>{
        return await this.registerService.registerPasskey(user);
    }

    @Post("passkey/validate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(204)
    async validatePasskey(@User() user: UserEntity, @Body() body: RegistrationResponseJSON): Promise<void>{
        await this.registerService.validatePasskey(user, body);
    }

    @Post("2fa")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async register2fa(@User() user: UserEntity): Promise<TotpRegisterPayload>{
        return await this.registerService.generate2FaSecret(user);
    }

    @Post("2fa/validate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(204)
    async validate2fa(@User() user: UserEntity, @Body() body: TotpDto): Promise<void>{
        await this.registerService.validate2Fa(user, body.code);
    }
}
