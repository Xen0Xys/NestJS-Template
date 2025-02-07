import {Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, UseGuards} from "@nestjs/common";
import {PublicPasskeyEntity} from "./models/entities/public-passkey.entity";
import {UserEntity} from "./models/entities/user.entity";
import {JwtAuthGuard} from "./guards/jwt-auth.guard";
import {User} from "./decorators/user.decorator";
import {ApiBearerAuth} from "@nestjs/swagger";
import {AuthService} from "./auth.service";

@Controller("auth")
export class AuthController{
    constructor(
        private readonly authService: AuthService,
    ){}

    @Delete("passkey/:passkey_id")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async deletePasskey(@User() user: UserEntity, @Param("passkey_id") passkeyId: string): Promise<void>{
        return await this.authService.deletePasskey(user, passkeyId);
    }

    @Get("passkey")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getPasskeys(@User() user: UserEntity): Promise<PublicPasskeyEntity[]>{
        return await this.authService.getPasskeys(user);
    }

    @Get("2fa")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    async get2faStatus(@User() user: UserEntity): Promise<void>{
        if(!await this.authService.is2faEnabled(user))
            throw new NotFoundException("2FA not enabled");
    }

    @Delete("2fa")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async delete2fa(@User() user: UserEntity): Promise<void>{
        return await this.authService.disableTwoFactorAuth(user);
    }

    @Delete("logout/all")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async logoutAll(@User() user: UserEntity): Promise<void>{
        await this.authService.invalidateTokens(user);
    }
}
