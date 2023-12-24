import {CanActivate, ExecutionContext, HttpStatus, Injectable} from "@nestjs/common";
import {EncryptionService} from "../../encryption/encryption.service";
import {JwtPayloadModel} from "../models/jwt-payload.model";
import {UsersService} from "../../users/users.service";
import {FastifyRequest} from "fastify";

@Injectable()
export class AuthGuard implements CanActivate{

    constructor(private encryptionService: EncryptionService, private usersService: UsersService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const result = context.switchToHttp().getResponse();
        const token = this.extractTokenFromHeader(request);
        if(!token){
            result.status(HttpStatus.BAD_REQUEST);
            result.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Missing bearer token"
            });
            return false;
        }
        let payload;
        try{
            payload = <JwtPayloadModel>this.encryptionService.verifyJWT(token, process.env.JWT_KEY);
        }catch (e){
            result.status(HttpStatus.BAD_REQUEST);
            result.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid bearer token"
            });
            return false;
        }
        if(!payload){
            result.status(HttpStatus.BAD_REQUEST);
            result.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid bearer token"
            });
            return false;
        }
        const user = await this.usersService.findOne(payload.id);
        if(!user){
            result.status(HttpStatus.BAD_REQUEST);
            result.send({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid bearer token"
            });
            return false;
        }
        delete user.password;
        request.user = user;
        return true;
    }

    private extractTokenFromHeader(request: FastifyRequest): string | undefined{
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
