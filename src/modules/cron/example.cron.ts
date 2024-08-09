import {Injectable, Logger} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";

@Injectable()
export class ExampleCron{
    private readonly logger: Logger = new Logger(ExampleCron.name);

    @Cron("0 0 0 * * *")
    async handleCron(){
        this.logger.debug("Called when the current time is 00:00:00");
    }
}
