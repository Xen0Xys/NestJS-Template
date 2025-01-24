import {EmailsModuleOptions} from "./interfaces/emails-module-options.interface";
import {DynamicModule, Module} from "@nestjs/common";
import {EmailsService} from "./emails.service";
import {EMAILS_OPTIONS} from "./constants";

@Module({})
export class EmailsModule{
    static forRoot(options: EmailsModuleOptions): DynamicModule{
        return {
            module: EmailsModule,
            global: options.isGlobal,
            providers: [
                {
                    provide: EMAILS_OPTIONS,
                    useValue: options,
                },
                EmailsService,
            ],
            exports: [EmailsService],
        };
    }
}
