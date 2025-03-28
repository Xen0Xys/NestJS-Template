import {BadRequestException, Injectable} from "@nestjs/common";
import sharp, {Sharp} from "sharp";

@Injectable()
export class FilesService{
    constructor(){}

    async toWebp(data: Buffer): Promise<Buffer>{
        return await sharp(data).webp({
            preset: "picture",
            effort: 6,
            smartSubsample: false,
            quality: 80,
            nearLossless: false,
            lossless: false,
            alphaQuality: 100,
        }).toBuffer();
    }

    async toAvatar(data: Buffer): Promise<Buffer>{
        const sharpBuffer: Sharp = sharp(await this.toWebp(data));
        if((await sharpBuffer.metadata()).width < 256 || (await sharpBuffer.metadata()).height < 256)
            throw new BadRequestException("Invalid image size (minimum 256x256)");
        return await sharpBuffer.resize(256, 256, {
            fit: "cover",
        }).toBuffer();
    }
}
