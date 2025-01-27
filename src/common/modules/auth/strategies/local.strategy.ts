import {UserEntity} from "../models/entities/user.entity";
import {PassportStrategy} from "@nestjs/passport";
import {AuthService} from "../auth.service";
import {Injectable} from "@nestjs/common";
import {Strategy} from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local"){
    constructor(
        private readonly authService: AuthService,
    ){
        super();
    }

    async validate(username: string, password: string): Promise<UserEntity>{
        return new UserEntity(await this.authService.validateUser(username, password));
    }
}
