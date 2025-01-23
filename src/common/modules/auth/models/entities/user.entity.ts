import {Users} from "@prisma/client";
import {Exclude} from "class-transformer";

export class UserEntity implements Users{
    id: string;
    email: string;
    username: string;
    created_at: Date;
    updated_at: Date;

    @Exclude()
    password: string;

    constructor(partial: Partial<UserEntity>){
        Object.assign(this, partial);
    }
}
