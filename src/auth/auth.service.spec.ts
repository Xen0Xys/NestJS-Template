import {Test, TestingModule} from "@nestjs/testing";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {EncryptionService} from "../encryption/encryption.service";

describe("AuthService", () => {
    let service: AuthService;

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, UsersService, EncryptionService],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
