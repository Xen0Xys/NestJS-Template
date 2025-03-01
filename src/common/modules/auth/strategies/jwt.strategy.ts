import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UserEntity} from "../models/entities/user.entity";
import {JwtScope} from "../models/enums/jwt-scope";
import {ExtractJwt, Strategy} from "passport-jwt";
import {PassportStrategy} from "@nestjs/passport";
import {UsersService} from "../../../../modules/users/users.service";
import {JwtPayload} from "jsonwebtoken";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
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

    async validate(payload: JwtPayload){
        if(payload.scope !== JwtScope.USAGE)
            throw new UnauthorizedException("Invalid scope");
        const user: UserEntity = await this.usersService.getUserById(payload.sub);
        if(user.tokenId !== payload.jti)
            throw new UnauthorizedException("Invalid token");
        return user;
    }
}
