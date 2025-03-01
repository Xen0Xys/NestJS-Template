import {type StorageProvider} from "./storage.provider";

export class FilesystemStorageProvider implements StorageProvider{
    async uploadBuffer(file: Buffer, sum: string): Promise<void>{
        await Bun.file(`${sum.substring(0, 2)}/${sum.substring(2, 4)}/${sum}`).write(file);
    }

    async uploadStream(file: ReadableStream, sum: string): Promise<void>{
        await Bun.write(`${sum.substring(0, 2)}/${sum.substring(2, 4)}/${sum}`, new Response(file));
    }

    async removeFile(sum: string): Promise<void>{
        await Bun.file(`${sum.substring(0, 2)}/${sum.substring(2, 4)}/${sum}`).delete();
    }

    async getBuffer(sum: string): Promise<Buffer>{
        throw new Error("Method not implemented.");
    }

    async getStream(sum: string): Promise<ReadableStream>{
        throw new Error("Method not implemented.");
    }

    async list(take: number, skip: number): Promise<string[]>{
        throw new Error("Method not implemented.");
    }
}
