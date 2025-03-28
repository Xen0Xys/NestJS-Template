import {UserEntity} from "../entities/user.entity";
import {AuthTypes} from "@prisma/client";

export class LoginPayload{
    user: UserEntity;
    authType?: AuthTypes;
    token: string;

    constructor(partial: Partial<LoginPayload>){
        Object.assign(this, partial);
    }
}
