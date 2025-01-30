import {Body, Controller, HttpCode, NotImplementedException, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {RegisterDto} from "./models/dto/register.dto";
import {RegisterService} from "./register.service";
import {ConfirmEmailDto} from "./models/dto/confirm-email.dto";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {TotpRegisterPayload} from "./models/payloads/totp-register.payload";
import {TotpDto} from "./models/dto/totp.dto";

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
    registerPasskey(){
        throw new NotImplementedException();
    }

    @Post("passkey/validate")
    validatePasskey(){
        throw new NotImplementedException();
    }

    @Post("2fa")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async register2fa(@Req() req: any): Promise<TotpRegisterPayload>{
        // TODO: Fix QR code generation
        return await this.registerService.generate2FaSecret(req.user);
    }

    @Post("2fa/validate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(204)
    async validate2fa(@Req() req: any, @Body() body: TotpDto): Promise<void>{
        await this.registerService.validate2Fa(req.user, body.code);
    }
}
