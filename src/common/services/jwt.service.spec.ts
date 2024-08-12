import {Test, TestingModule} from "@nestjs/testing";
import {JwtService} from "./jwt.service";
import {CipherService} from "./cipher.service";
import * as dotenv from "dotenv";

dotenv.config({path: ".env.ci"});

describe("ServicesService", () => {
    let service: JwtService;
    let cipherService: CipherService;

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtService, CipherService],
        }).compile();

        service = module.get<JwtService>(JwtService);
        cipherService = module.get<CipherService>(CipherService);
    });

    it("should be defined", () => {
        expect(cipherService).toBeDefined();
    });

    const content = "test";
    describe("JWT tests", () => {
        it("Symmetric JWT", () => {
            const token = service.generateJWT({content}, process.env.TOKEN_DURATION, process.env.JWT_SECRET);
            expect(typeof token).toBe("string");
            const decoded = service.verifyJWT(token, process.env.JWT_SECRET);
            expect(typeof decoded).toBe("object");
            expect(decoded).toHaveProperty("content");
        });
        it("Verify JWT with wrong key", async() => {
            const token = service.generateJWT({content}, process.env.TOKEN_DURATION, process.env.JWT_SECRET);
            expect(() => service.verifyJWT(token, "wrong_key")).toThrow(Error);
        });
        it("Verify no JWT content", async() => {
            expect(() => service.verifyJWT("invalid_content", process.env.JWT_SECRET)).toThrow(Error);
        });
        it("Asymmetric JWT", () => {
            const localKeyPair = cipherService.generateKeyPair(2048);
            const token = service.generateJWT({content}, process.env.TOKEN_DURATION, localKeyPair.privateKey, false);
            expect(typeof token).toBe("string");
            const decoded = service.verifyJWT(token, localKeyPair.publicKey);
            expect(typeof decoded).toBe("object");
            expect(decoded).toHaveProperty("content");
        });
        it("Asymmetric JWT with private encryption key", () => {
            const localKeyPair = cipherService.generateKeyPair(2048, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            const token = service.generateJWT({content}, process.env.TOKEN_DURATION, localKeyPair.privateKey, false, process.env.ASYMMETRIC_ENCRYPTION_KEY);
            expect(typeof token).toBe("string");
            const decoded = service.verifyJWT(token, localKeyPair.publicKey);
            expect(typeof decoded).toBe("object");
            expect(decoded).toHaveProperty("content");
        });
    });
});
