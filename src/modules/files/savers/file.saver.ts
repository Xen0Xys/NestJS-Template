import {Saver} from "./saver";
import fs, {createReadStream, ReadStream} from "fs";

export class FileSaver implements Saver{

    private readonly uploadFolderName: string;

    constructor(uploadFolderName: string){
        this.uploadFolderName = uploadFolderName;
    }

    async saveFile(data: Buffer, fileName: string): Promise<void>{
        const path = `./${this.uploadFolderName}/${fileName.substring(0, 2)}`;
        if(!fs.existsSync(path)){
            fs.mkdirSync(path, {
                recursive: true
            });
        }
        fs.writeFileSync(`${path}/${fileName}`, data);
    }

    async getFile(fileName: string): Promise<ReadStream>{
        return createReadStream(`./${this.uploadFolderName}/${fileName.substring(0, 2)}/${fileName}`);
    }

}
