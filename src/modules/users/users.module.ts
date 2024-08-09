import {ServicesModule} from "../../common/services/services.module";
import {UsersController} from "./users.controller";
import {UsersService} from "./users.service";
import {Module} from "@nestjs/common";

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
    imports: [ServicesModule]
})
export class UsersModule{}
