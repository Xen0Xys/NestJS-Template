import {type StorageProvider} from "./storage.provider";

export class S3StorageProvider implements StorageProvider{
    constructor(){
        // TODO: Build S3 connection here
    }

    uploadFile(file: ReadableStream): void{
        console.log(file);
        throw new Error("Method not implemented.");
    }

    removeFile(sum: string): void{
        console.log(sum);
        throw new Error("Method not implemented.");
    }

    getFile(sum: string): ReadableStream{
        console.log(sum);
        throw new Error("Method not implemented.");
    }
}
