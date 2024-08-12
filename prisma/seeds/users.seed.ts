import {CipherService} from "../../src/common/services/cipher.service";

const cipherService = new CipherService();

export default async() => [
    {
        username: "admin",
        password: await cipherService.hashPassword("password"),
        group_id: 2,
    }
];
