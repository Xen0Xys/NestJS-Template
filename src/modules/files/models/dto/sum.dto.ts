import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export class SumDto{
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
        sum: string;
}
