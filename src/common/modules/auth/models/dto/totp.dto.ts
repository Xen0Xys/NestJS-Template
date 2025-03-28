import {IsNotEmpty, IsString} from "class-validator";

export class TotpDto{
    @IsString()
    @IsNotEmpty()
    code: string;
}
