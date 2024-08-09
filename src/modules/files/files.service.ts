import {PrismaService} from "../../common/services/prisma.service";
import {Injectable, NotFoundException} from "@nestjs/common";
import {CipherService} from "../../common/services/cipher.service";
import {ConfigService} from "@nestjs/config";
import {Saver} from "./savers/saver";
import {FileSaver} from "./savers/file.saver";

@Injectable()
export class FilesService{

    private readonly saver: Saver;

    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly cipherService: CipherService,
    ){
        this.saver = new FileSaver(this.configService.get("UPLOADS_PATH"));
    }

    async uploadFile(userId: number, data: Buffer, fileName: string, size: number){
        const sum = this.cipherService.getSum(data);
        await this.saver.saveFile(data, sum);
        await this.prismaService.file.create({
            data: {
                name: fileName,
                size,
                sum,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
    }

    async downloadFile(sum: string): Promise<any>{
        const file = await this.prismaService.file.findUnique({
            where: {
                sum
            }
        });
        if(!file)
            throw new NotFoundException("File not found");
        return {
            readStream: await this.saver.getFile(file.sum),
            name: file.name,
            size: file.size
        };
    }
}
