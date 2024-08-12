import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {CustomValidationPipe} from "./common/pipes/custom-validation.pipe";
import {LoggerMiddleware} from "./common/middlewares/logger.middleware";
import {SwaggerTheme, SwaggerThemeNameEnum} from "swagger-themes";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import fastifyMultipart from "@fastify/multipart";
import fastifyCookie from "@fastify/cookie";
import fastifyHelmet from "@fastify/helmet";
import {RawServerDefault} from "fastify";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {Logger} from "@nestjs/common";
import * as process from "process";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";

dotenv.config();

const logger: Logger = new Logger("App");

async function bootstrap(){
    switch (process.env.SERVER_TYPE){
        case "http":
            await startHttpServer();
            break;
        case "https":
            await startHttpsServer();
            break;
        default:
            logger.error("Invalid SERVER_TYPE");
            process.exit(1);
    }
}

function getServerAddress(bindAddress: string, port: string | number, protocol: string){
    if(bindAddress === "0.0.0.0"){
        const ifaces = os.networkInterfaces();
        Object.keys(ifaces).forEach(function(ifname){
            let alias = 0;
            ifaces[ifname].forEach(function(iface){
                if("IPv4" !== iface.family || iface.internal !== false)
                    return;
                if(alias >= 1)
                    bindAddress = iface.address;
                else
                    bindAddress = iface.address;
                ++alias;
            });
        });
    }
    return `${protocol}://${bindAddress}:${port}`;
}

function logServerStart(bindAddress: string, port: string | number, protocol: string){
    logger.log(`Server started on ${getServerAddress(bindAddress, port, protocol)}`);
}

async function startHttpServer(){
    const httpApp = await NestFactory.create<NestFastifyApplication>(AppModule , new FastifyAdapter({exposeHeadRoutes: true}));
    await loadServer(httpApp);
    await httpApp.listen(process.env.SERVER_PORT, process.env.SERVER_ADDRESS);
    logServerStart(process.env.SERVER_ADDRESS, process.env.SERVER_PORT, "http");
}

async function startHttpsServer(){
    const httpsOptions = {
        allowHTTP1: true,
        key: fs.readFileSync(process.env.SSL_KEY_FILE),
        cert: fs.readFileSync(process.env.SSL_CERT_FILE),
    };
    const httpsApp = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({http2: true, https: httpsOptions}));
    await loadServer(httpsApp);
    await httpsApp.listen(process.env.SERVER_PORT, process.env.SERVER_ADDRESS);
    logServerStart(process.env.SERVER_ADDRESS, process.env.SERVER_PORT, "https");
}

async function loadServer(server: NestFastifyApplication<RawServerDefault>){
    // Config
    server.setGlobalPrefix(process.env.PREFIX);
    server.enableCors({
        origin: "*",
    });

    // Middlewares
    server.use(new LoggerMiddleware().use);
    await server.register(fastifyMultipart as any);
    await server.register(fastifyCookie as any, {
        secret: process.env.COOKIE_SECRET,
    }as any);
    await server.register(fastifyHelmet as any, {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
    }as any);

    // Swagger
    const config = new DocumentBuilder()
        .setTitle("Phoenix API")
        .setDescription("Documentation for the Phoenix API")
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

    server.useGlobalPipes(new CustomValidationPipe());
}

bootstrap();
