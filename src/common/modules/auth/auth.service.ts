import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../helper/prisma.service";
import {CipherService} from "../helper/cipher.service";
import {Users} from "@prisma/client";
import {JwtService} from "../helper/jwt.service";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
    ){}

    async validateUser(username: string, password: string): Promise<Users>{
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                email: username,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        if(!this.cipherService.comparePassword(password, user.password))
            throw new UnauthorizedException("Invalid password");
        return user;
    }

    generateJwt(user: Users){
        return this.jwtService.generateJWT({id: user.id}, "7d", process.env.APP_KEY || "couscous");
    }
}
