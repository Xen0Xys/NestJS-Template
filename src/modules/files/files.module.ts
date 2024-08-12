import {ServicesModule} from "../../common/services/services.module";
import {FilesController} from "./files.controller";
import {FilesService} from "./files.service";
import {Module} from "@nestjs/common";
import {AuthModule} from "../auth/auth.module";

@Module({
    controllers: [FilesController],
    providers: [FilesService],
    imports: [ServicesModule, AuthModule],
})
export class FilesModule{}
