import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {UsersService} from "../../../../modules/users/users.service";
import {JwtPayload} from "jsonwebtoken";
import {JwtScope} from "../models/enums/jwt-scope";
import {UserEntity} from "../models/entities/user.entity";

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, "auth-jwt"){
    constructor(
        private readonly usersService: UsersService,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.APP_SECRET,
            issuer: process.env.APP_NAME,
            algorithms: ["HS512"],
        });
    }

    async validate(payload: JwtPayload): Promise<any>{
        if(payload.scope === JwtScope.USAGE)
            throw new UnauthorizedException("Invalid scope");
        const user: UserEntity = await this.usersService.getUserById(payload.sub);
        if(user.tokenId !== payload.jti)
            throw new UnauthorizedException("Invalid token");
        return {
            user,
            scope: payload.scope,
        };
    }
}
