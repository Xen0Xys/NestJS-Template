import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {PrismaService} from "../helper/prisma.service";
import {CipherService} from "../helper/cipher.service";
import {JwtService} from "@nestjs/jwt";
import {Users} from "@prisma/client";
import {UserEntity} from "./models/entities/user.entity";
import {EmailsService} from "../emails/emails.service";

@Injectable()
export class AuthService{
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
        private readonly jwtService: JwtService,
        private readonly emailsService: EmailsService,
    ){}

    async getUserById(id: string): Promise<Users>{
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                id: id,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        return user;
    }

    async getUserByEmail(email: string): Promise<Users>{
        const user: Users = await this.prismaService.users.findUnique({
            where: {
                email: email,
            },
        });
        if(!user)
            throw new NotFoundException("User not found");
        return user;
    }

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

    generateJwt(user: Users): string{
        return this.jwtService.sign({sub: user.id});
    }

    async sendMagicLink(user: UserEntity): Promise<void>{
        const token: string = this.jwtService.sign({sub: user.id});
        await this.emailsService.sendMail(user.email, "Magic Link", `Click here to login: http://localhost:3000/auth/login/magic?token=${token}`);
    }
}
