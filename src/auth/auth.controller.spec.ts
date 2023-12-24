import {Test, TestingModule} from "@nestjs/testing";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {EncryptionService} from "../encryption/encryption.service";
import {UsersService} from "../users/users.service";

describe("AuthController", () => {
    let controller: AuthController;

    beforeEach(async() => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, EncryptionService, UsersService],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
