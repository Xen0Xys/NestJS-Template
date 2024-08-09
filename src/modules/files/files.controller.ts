import {FilesService} from "./files.service";
import {
    BadRequestException, Controller, Get, HttpStatus, Post, Query, Req, Res, StreamableFile,
    UploadedFile, UploadedFiles,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "../auth/guards/auth.guard";
import {FileInterceptor, FilesInterceptor} from "@nest-lab/fastify-multer";
import {SumDto} from "./models/dto/sum.dto";
import {FastifyReply} from "fastify";

@Controller("files")
@ApiTags("Files")
export class FilesController{
    constructor(
        private readonly filesService: FilesService,
    ){}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FileInterceptor("file", {
        limits: {
            fileSize: 500 * 1024 * 1024
        },
        fileFilter: (_, file, callback) => {
            if (!file.mimetype.match(/\/(.*)$/))
                return callback(new BadRequestException("Invalid file type"), false);
            callback(null, true);
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
                    description: "Files",
                }
            }
        }
    })
    @ApiResponse({status: HttpStatus.OK, description: "File updated"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Only files can be uploaded"})
    async uploadFile(
        @Req() req: any,
        @UploadedFile() file: any
    ){
        await this.filesService.uploadFile(req.user.id, file.buffer, file.originalname, file.size);
    }

    @Post("many")
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiConsumes("multipart/form-data")
    @UseInterceptors(FilesInterceptor("files", 100, {
        limits: {
            fileSize: 500 * 1024 * 1024,
        },
        fileFilter: (_, file, callback) => {
            if (!file.mimetype.match(/\/(.*)$/))
                return callback(new BadRequestException("Invalid file type"), false);
            callback(null, true);
        },
    }))
    @ApiBody({
        required: true,
        schema: {
            type: "object",
            properties: {
                files: {
                    type: "array",
                    items: {
                        type: "string",
                        format: "binary",
                    },
                    description: "Upload a folder containing multiple files. Each file in the folder will be handled separately on the server.",
                },
            },
        },
    })
    @ApiResponse({status: HttpStatus.OK, description: "Folder uploaded successfully"})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: "Authentication required"})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: "Invalid files in the folder"})
    async uploadFolder(
        @Req() req: any,
        @UploadedFiles() files: Array<any>
    ){
        for (const file of files)
            await this.filesService.uploadFile(req.user.id, file.buffer, file.originalname, file.size);
    }

    @Get()
    @ApiBearerAuth()
    async downloadFile(
        @Res({passthrough: true}) res: FastifyReply,
        @Query() query: SumDto
    ): Promise<StreamableFile>{
        const fileData = await this.filesService.downloadFile(query.sum);
        res.header("Content-Disposition", `attachment; filename="${fileData.name}"`);
        res.header("Content-Type", "application/octet-stream");
        res.header("Content-Length", fileData.size.toString());
        return new StreamableFile(fileData.readStream);
    }
}
