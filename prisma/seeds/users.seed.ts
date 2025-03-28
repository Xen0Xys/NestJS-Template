import {CipherService} from "../../src/common/modules/helper/cipher.service";

export default async(cipherService: CipherService) => [
    {
        id: "0194b6f3-452b-7000-bcaa-ebb28bdbcfc1",
        email: "test@example.org",
        username: "test",
        password: cipherService.hashPassword("password"),
        token_id: "aa295a9d69f5a681d72894b33b687f27dcb3ace291dd736e0cb7c0937dae4e67",
        created_at: new Date(),
        updated_at: new Date(),
    },
];
