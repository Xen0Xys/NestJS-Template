import {UserEntity} from "../models/entities/user.entity";

export class LoginResponse{
    user: UserEntity;
    token: string;
}
