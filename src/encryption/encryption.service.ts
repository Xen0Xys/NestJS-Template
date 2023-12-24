import {Injectable} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import * as argon2 from "argon2";

@Injectable()
export class EncryptionService{
    getSum(content: string | Buffer): string{
        if(!content) content = "";
        return crypto.createHash("sha256").update(content).digest("hex");
    }

    async hashPassword(content: string | Buffer, cost = 10){
        if(!content) content = "";
        return await argon2.hash(content, {
            type: argon2.argon2id,
            timeCost: cost
        });
    }

    async comparePassword(hash: string, content: string | Buffer){
        if(!hash) return false;
        if(!content) content = "";
        return await argon2.verify(hash, content);
    }

    encryptSymmetric(content: string, encryptionKey: string | Buffer, timeCost = 200000){
        if(!content) content = "";
        const salt = crypto.randomBytes(32);
        const key = crypto.pbkdf2Sync(encryptionKey, salt, timeCost, 64, "sha512");
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key.subarray(0, 32), iv);
        let encrypted = cipher.update(content, "utf-8", "hex");
        encrypted += cipher.final("hex");
        const hmac = crypto.createHmac("sha256", key.subarray(32));
        hmac.update(`${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}`);
        const digest = hmac.digest("hex");
        return `${salt.toString("hex")}:${iv.toString("hex")}:${encrypted}:${digest}`;
    }

    decryptSymmetric(encryptedContent: string, encryptionKey: string | Buffer, timeCost = 200000){
        const [saltString, ivString, encryptedString, digest] = encryptedContent.split(":");
        const salt = Buffer.from(saltString, "hex");
        const key = crypto.pbkdf2Sync(encryptionKey, salt, timeCost, 64, "sha512");
        const iv = Buffer.from(ivString, "hex");
        const hmac = crypto.createHmac("sha256", key.subarray(32));
        hmac.update(`${saltString}:${ivString}:${encryptedString}`);
        const calculatedDigest = hmac.digest("hex");
        if (calculatedDigest !== digest)
            throw new Error("Integrity check failed");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key.subarray(0, 32), iv);
        let decrypted = decipher.update(encryptedString, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    }

    generateKeyPair(modulusLength = 4096, privateEncryptionKey = null){
        if(!privateEncryptionKey)
            console.warn("No private encryption key provided, the private key will not be encrypted");
        let privateKeyEncodingOptions = undefined;
        if(privateEncryptionKey){
            privateKeyEncodingOptions = {
                cipher: "aes-256-cbc",
                passphrase: privateEncryptionKey
            };
        }
        return crypto.generateKeyPairSync("rsa", {
            modulusLength: modulusLength,
            publicKeyEncoding: {
                type: "spki",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                ...privateKeyEncodingOptions
            }
        });
    }

    encryptAsymmetric(content: string, publicKey: string | Buffer){
        if(!content) content = "";
        const buffer = Buffer.from(content, "utf-8");
        const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        }, buffer);
        return encrypted.toString("base64");
    }

    decryptAsymmetric(encryptedContent: string, privateKey: string | Buffer, privateEncryptionKey = undefined){
        const buffer = Buffer.from(encryptedContent, "base64");
        if(!privateEncryptionKey)
            return crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
            }, buffer).toString("utf-8");
        else
            return crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                passphrase: privateEncryptionKey
            }, buffer).toString("utf-8");
    }

    generateJWT(content: any, expiresIn: string, jwtKey: string | Buffer, symmetric = true, privateEncryptionKey = undefined){
        const algorithm = symmetric ? "HS512" : "RS512";
        if(symmetric)
            return jwt.sign(content, jwtKey, {expiresIn, algorithm});
        else
            return jwt.sign(content, {key: jwtKey, passphrase: privateEncryptionKey}, {expiresIn, algorithm});
    }

    verifyJWT(token: string, jwtKey: string | Buffer){
        return jwt.verify(token, jwtKey);
    }
}
