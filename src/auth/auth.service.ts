import {Injectable} from "@nestjs/common";
import {EncryptionService} from "../encryption/encryption.service";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService{
    constructor(private encryptionService: EncryptionService, private usersService: UsersService){}

    getToken(userId: number){
        return this.encryptionService.generateJWT({id: userId}, process.env.TOKEN_DURATION, process.env.JWT_KEY);
    }
}
