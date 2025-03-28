import {StorageService} from "./storage.service";
import {FilesService} from "./files.service";
import {Module} from "@nestjs/common";

@Module({
    providers: [StorageService, FilesService],
    exports: [StorageService, FilesService],
})
export class StorageModule{}
