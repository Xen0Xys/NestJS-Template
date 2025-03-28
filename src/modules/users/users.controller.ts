import {BadRequestException, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtAuthGuard} from "../../common/modules/auth/guards/jwt-auth.guard";
import {UserEntity} from "../../common/modules/auth/models/entities/user.entity";
import {ApiBearerAuth, ApiBody, ApiConsumes} from "@nestjs/swagger";
import {User} from "src/common/modules/auth/decorators/user.decorator";
import {type File, FileInterceptor} from "@nest-lab/fastify-multer";
import {UsersService} from "./users.service";

@Controller("users")
export class UsersController{
    constructor(
        private readonly usersService: UsersService,
    ){}

    @Get("me")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    getMyself(@User() user: UserEntity): UserEntity{
        return user;
    }

    @Post("avatar")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file", {
        limits: {
            fileSize: 1024 * 1024 * 50,
        },
        fileFilter: (req, file, cb) => {
            if(!RegExp(/\/(jpg|jpeg|png|gif|webp|avif|mp3|opus|ogg|m4a|wav|flac|aac|mpeg)$/).exec(file.mimetype)){
                return cb(new BadRequestException("Only images can be uploaded"), false);
            }
            cb(null, true);
        },
    }))
    @ApiBody({
        required: true,
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                    description: "The file to upload (image or sound)",
                },
            },
        },
    })
    async uploadAvatar(@User() user: UserEntity, @UploadedFile() file: File){
        await this.usersService.setAvatar(user, file.buffer);
    }
}
