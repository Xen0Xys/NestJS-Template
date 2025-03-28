import {CacheInterceptor} from "@nestjs/cache-manager";
import {VersionEntity} from "./common/models/entities/version.entity";
import {Controller, Get, UseInterceptors} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";

@Controller()
@ApiTags("Misc")
@UseInterceptors(CacheInterceptor)
export class AppController{
    @Get("version")
    async getVersion(): Promise<VersionEntity>{
        return {
            version: process.env.npm_package_version,
        };
    }
}
