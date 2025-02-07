import {MagicLinkLoginDto} from "./models/dto/magic-link-login.dto";
import {Body, Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards} from "@nestjs/common";
import {LoginPayload} from "./models/payloads/login.payload";
import {LocalLoginDto} from "./models/dto/local-login.dto";
import {UserEntity} from "./models/entities/user.entity";
import {JwtScope} from "./models/enums/jwt-scope";
import {LoginService} from "./login.service";
import {AuthTypes} from "@prisma/client";
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {TotpDto} from "./models/dto/totp.dto";
import {UsersService} from "../../../modules/users/users.service";
import {AuthenticationResponseJSON} from "@simplewebauthn/server";

@Controller("auth/login")
@ApiTags("Auth")
export class LoginController{
    constructor(
        private readonly loginService: LoginService,
        private readonly usersService: UsersService,
    ){}

    /**
     * Logs in the user using email and password
     *
     * @throws {401} Invalid password
     * @throws {404} User not found
     * @throws {500} Internal server error
     */
    @Post("")
    async login(@Body() body: LocalLoginDto): Promise<LoginPayload>{
        const user: UserEntity = await this.loginService.validateUser(body.email, body.password);
        if(!await this.loginService.isUserVerified(user.id))
            throw new UnauthorizedException("User not verified");
        const authType: AuthTypes = await this.loginService.getUserAuthType(user.id);
        const token: string = this.loginService.generateToken(
            user.id,
            user.tokenId,
            authType === AuthTypes.PASSWORD ? JwtScope.USAGE : JwtScope.AUTH,
        );
        return new LoginPayload({
            user,
            authType: authType !== AuthTypes.PASSWORD ? authType : undefined,
            token,
        });
    }

    /**
     * Sends a magic link to the user's email
     *
     * @throws {400} Bad request
     * @throws {401} User not verified
     * @throws {404} User not found
     * @throws {500} Internal server error
     */
    @Post("magic")
    @HttpCode(204)
    async sendMagicLink(@Body() body: MagicLinkLoginDto): Promise<void>{
        const user: UserEntity = await this.usersService.getUserByEmail(body.email);
        if(!await this.loginService.isUserVerified(user.id))
            throw new UnauthorizedException("User not verified");
        await this.loginService.sendMagicLink(body.email);
    }

    /**
     * Handles the login callback for the authentication process (Magic Link, Passkey, 2FA)
     *
     * @throws {401} Unauthorized
     * @throws {500} Internal server error
     */
    @Post("callback")
    @UseGuards(AuthGuard("auth-jwt"))
    @ApiBearerAuth()
    async loginCallback(@Req() req: any): Promise<LoginPayload>{
        // TODO: Fix this line
        req = req.user;
        if(req.scope === JwtScope.MAGIC){
            // Check for 2FA/Passkey
            const authType: AuthTypes = await this.loginService.getUserAuthType(req.user.id);
            const token: string = this.loginService.generateToken(
                req.user.id,
                req.user.tokenId,
                authType === AuthTypes.PASSWORD ? JwtScope.USAGE : JwtScope.AUTH,
            );
            return new LoginPayload({
                user: req.user,
                authType: authType !== AuthTypes.PASSWORD ? authType : undefined,
                token,
            });
        }
        const authToken: string = this.loginService.generateToken(
            req.user.id,
            req.user.tokenId,
            JwtScope.USAGE,
        );
        return new LoginPayload({
            user: req.user,
            token: authToken,
        });
    }

    @Post("passkey/request")
    @UseGuards(AuthGuard("auth-jwt"))
    @ApiBearerAuth()
    async requestPasskeyLogin(@Req() req: any): Promise<PublicKeyCredentialRequestOptionsJSON>{
        req = req.user;
        return await this.loginService.requestPasskeyLogin(req.user);
    }

    @Post("passkey/validate")
    @UseGuards(AuthGuard("auth-jwt"))
    @ApiBearerAuth()
    async validatePasskeyLogin(@Req() req: any, @Body() body: AuthenticationResponseJSON): Promise<LoginPayload>{
        req = req.user;
        if(!await this.loginService.validatePasskeyLogin(req.user, body))
            throw new UnauthorizedException("Invalid passkey");
        const token: string = this.loginService.generateToken(
            req.user.id,
            req.user.tokenId,
            JwtScope.USAGE,
        );
        return new LoginPayload({
            user: req.user,
            token,
        });
    }

    @Post("2fa")
    @UseGuards(AuthGuard("auth-jwt"))
    @ApiBearerAuth()
    async login2fa(@Req() req: any, @Body() body: TotpDto): Promise<LoginPayload>{
        // TODO: Fix this line
        req = req.user;
        if(!await this.loginService.validate2fa(req.user, body.code))
            throw new UnauthorizedException("Invalid 2FA code");
        const token: string = this.loginService.generateToken(
            req.user.id,
            req.user.tokenId,
            JwtScope.USAGE,
        );
        return new LoginPayload({
            user: req.user,
            token,
        });
    }
}
