import {Module} from "@nestjs/common";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {StorageModule} from "../../common/modules/storage/storage.module";

@Module({
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
    imports: [StorageModule],
})
export class UsersModule{}
