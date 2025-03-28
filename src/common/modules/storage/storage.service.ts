import {Injectable, Logger, NotImplementedException} from "@nestjs/common";
import {BunFile, FileSink, S3Client, S3File} from "bun";
import {CipherService} from "../helper/cipher.service";
import {PrismaService} from "../helper/prisma.service";
import {Files} from "@prisma/client";

@Injectable()
export class StorageService{
    private readonly s3Client?: S3Client;
    private readonly logger: Logger = new Logger(StorageService.name);

    constructor(
        private readonly cipherService: CipherService,
        private readonly prismaService: PrismaService,
    ){
        if(process.env.S3_ENDPOINT)
            this.s3Client = new S3Client({
                endpoint: process.env.S3_ENDPOINT,
                bucket: process.env.S3_BUCKET,
                region: process.env.S3_REGION,
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
            });
    }

    private getFileName(sum: string): string{
        if(this.s3Client)
            return `./${sum.substring(0, 2)}/${sum.substring(2, 4)}/${sum}`;
        return `./.storage/${sum.substring(0, 2)}/${sum.substring(2, 4)}/${sum}`;
    }

    private getTempFileName(uuid: string): string{
        if(this.s3Client)
            return `./.tmp/${uuid}`;
        return `./.storage/.tmp/${uuid}`;
    }

    async uploadBuffer(data: Buffer): Promise<string>{
        const sum: string = this.cipherService.getSum(data);
        const databaseFile: Files = await this.prismaService.files.findUnique({
            where: {
                id: sum,
            },
        });
        if(databaseFile)
            return sum;
        const fileName: string = this.getFileName(sum);
        this.logger.debug(`Uploading file ${fileName}`);
        let file: BunFile | S3File;
        if(this.s3Client)
            file = this.s3Client.file(fileName);
        else
            file = Bun.file(fileName);
        await file.write(data);

        // Add file to database
        await this.prismaService.files.create({
            data: {
                id: sum,
            },
        });
        return sum;
    }

    async uploadStream(data: ReadableStream): Promise<string>{
        // Write temp file
        const tempFileName: string = this.getTempFileName(Bun.randomUUIDv7());
        let tempFile: BunFile | S3File;
        if(this.s3Client && process.env.S3_TEMP_FILES === "true")
            tempFile = this.s3Client.file(tempFileName);
        else
            tempFile = Bun.file(tempFileName);
        const writer: FileSink = tempFile.writer();
        const hasher = new Bun.CryptoHasher("sha256");
        for await (const chunk of data){
            writer.write(chunk);
            hasher.update(chunk);
        }
        const sum: string = hasher.digest().toString("hex");
        const databaseFile: Files = await this.prismaService.files.findUnique({
            where: {
                id: sum,
            },
        });
        if(databaseFile){
            await tempFile.delete();
            return sum;
        }
        const fileName: string = this.getFileName(sum);
        this.logger.debug(`Uploading file ${fileName}`);

        // Write final file using temp file and computed sum
        let file: BunFile | S3File;
        if(this.s3Client)
            file = this.s3Client.file(fileName);
        else
            file = Bun.file(fileName);
        const fileWriter: FileSink = file.writer();
        for await (const chunk of tempFile.stream())
            fileWriter.write(chunk);

        // Delete temp file
        await tempFile.delete();

        // Add file to database
        await this.prismaService.files.create({
            data: {
                id: sum,
            },
        });
        return sum;
    }

    async downloadBuffer(sum: string): Promise<Buffer>{
        const fileName: string = this.getFileName(sum);
        this.logger.debug(`Downloading file ${fileName}`);
        if(this.s3Client)
            return Buffer.from(await this.s3Client.file(fileName).arrayBuffer());
        else
            return Buffer.from(await Bun.file(fileName).arrayBuffer());
    }

    downloadStream(sum: string): ReadableStream{
        const fileName: string = this.getFileName(sum);
        this.logger.debug(`Downloading file ${fileName}`);
        if(this.s3Client)
            return this.s3Client.file(fileName).stream();
        else
            return Bun.file(fileName).stream();
    }

    async deleteFile(sum: string): Promise<void>{
        // Remove file from database
        await this.prismaService.files.delete({
            where: {
                id: sum,
            },
        });

        const fileName: string = this.getFileName(sum);
        this.logger.debug(`Deleting file ${fileName}`);
        if(this.s3Client)
            await this.s3Client.delete(fileName);
        else
            await Bun.file(fileName).delete();
    }

    async listFiles(_take: number, _skip: number): Promise<string[]>{
        this.logger.debug(`Listing ${_take} files starting from ${_skip}`);
        throw new NotImplementedException("File listing is not implemented yet");
    }
}
