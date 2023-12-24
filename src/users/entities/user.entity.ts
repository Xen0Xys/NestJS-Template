import {ApiProperty} from "@nestjs/swagger";
import {User} from "@prisma/client";

export class UserEntity implements User{
    @ApiProperty()
        id: number;
    @ApiProperty()
        username: string;
    @ApiProperty()
        password: string;
    @ApiProperty()
        groupId: number;
    @ApiProperty()
        createdAt: Date;
    @ApiProperty()
        updatedAt: Date;
}
