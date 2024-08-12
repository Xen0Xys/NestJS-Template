import {ExampleCron} from "./example.cron";
import {Module} from "@nestjs/common";

@Module({
    providers: [
        ExampleCron,
    ],
})
export class CronModule{}
