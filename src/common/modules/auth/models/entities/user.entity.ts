import {Exclude} from "class-transformer";
import {Providers} from "@prisma/client";

export class UserEntity{
    id: string;
    email: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    verified: boolean;
    avatarId: string;

    @Exclude()
    provider: Providers;

    @Exclude()
    password: string;

    @Exclude()
    tokenId: string;

    constructor(partial: Partial<UserEntity>){
        Object.assign(this, partial);
    }
}
