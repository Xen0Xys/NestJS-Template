import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {CustomValidationPipe} from "./common/pipes/custom-validation.pipe";
import {AsyncApiDocumentBuilder, AsyncApiModule} from "nestjs-asyncapi";
import {LoggerMiddleware} from "./common/middlewares/logger.middleware";
import {SwaggerTheme, SwaggerThemeNameEnum} from "swagger-themes";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {FastifyListenOptions} from "fastify/types/instance";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyHelmet from "@fastify/helmet";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {Logger} from "@nestjs/common";
import * as process from "process";
import * as dotenv from "dotenv";
import {join} from "node:path";

dotenv.config();

declare const module: any;

const logger: Logger = new Logger("App");

const appName: string = process.env.npm_package_name.split("-").map((word: string): string => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
const port: number = parseInt(process.env.PORT) || 4000;

async function bootstrap(){
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({exposeHeadRoutes: true}),
    );
    await loadServer(app);

    await app.listen({
        port: port,
        host: "0.0.0.0",
    } as FastifyListenOptions);
    app.enableShutdownHooks();
    if(module.hot){
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
    logger.log(`Listening on http://0.0.0.0:${port}`);
}

async function loadServer(server: NestFastifyApplication){
    // Config
    server.setGlobalPrefix(process.env.PREFIX);
    server.enableCors({
        origin: "*",
    });

    // Middlewares
    server.use(new LoggerMiddleware().use);
    await server.register(fastifyMultipart as any);
    await server.register(fastifyStatic as any, {
        root: join(process.cwd(), "public_answers"),
        prefix: "/public_answers/",
    });
    await server.register(fastifyHelmet as any, {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
    } as any);

    // Swagger
    const config = new DocumentBuilder()
        .setTitle(appName)
        .setDescription(`Documentation for ${appName}`)
        .setVersion(process.env.npm_package_version)
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(server, config);
    const theme = new SwaggerTheme();
    const customCss = theme.getBuffer(SwaggerThemeNameEnum.DARK);
    SwaggerModule.setup("api", server, document, {
        swaggerOptions: {
            filter: true,
            displayRequestDuration: true,
            persistAuthorization: true,
            docExpansion: "none",
            tagsSorter: "alpha",
            operationsSorter: "method",
        },
        customCss,
    });

    const asyncApiOptions = new AsyncApiDocumentBuilder()
        .setTitle(appName)
        .setDescription(`Documentation for ${appName}`)
        .setVersion(process.env.npm_package_version)
        .setDefaultContentType("application/json")
        .addServer("Test", {
            url: `http://localhost:${port}`,
            protocol: "http",
            security: [{jwt: []}],
        })
        .addSecurity("jwt", {
            type: "httpApiKey" as any,
            name: "Authorization",
            in: "header",
        })
        .build();
    const asyncApiDocument = AsyncApiModule.createDocument(server, asyncApiOptions);
    await AsyncApiModule.setup("asyncapi", server, asyncApiDocument);

    server.useGlobalPipes(new CustomValidationPipe());
}

bootstrap();
