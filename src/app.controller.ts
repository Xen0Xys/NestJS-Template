import {VersionEntity} from "./common/models/entities/version.entity";
import {Controller, Get, UseInterceptors} from "@nestjs/common";
import {ApiTags} from "@nestjs/swagger";
import {CacheInterceptor} from "@nestjs/cache-manager";

@Controller()
@ApiTags("Misc")
@UseInterceptors(CacheInterceptor)
export class AppController{
    @Get("version")
    getVersion(): VersionEntity{
        return {
            version: process.env.npm_package_version,
        };
    }
}
