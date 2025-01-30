import {PrismaClient} from "@prisma/client";
import usersSeed from "./seeds/users.seed";
import {CipherService} from "../src/common/modules/helper/cipher.service";

const cipherService = new CipherService();

// initialize Prisma Client
const prisma = new PrismaClient();

async function main(){
    const gStart = Date.now();

    let start = new Date();
    console.log("🌱  Seeding users...");
    await seed(prisma.users, await usersSeed(cipherService));
    console.log(`✅  Seeding users completed ! (${Date.now() - start.getTime()}ms)`);

    console.log(`\n✅  Seeding completed ! (${Date.now() - gStart}ms)`);
}

async function seed(table: any, data: any[], idField = "id"){
    data.map(async(current) => {
        await table.upsert({
            where: {id: current[idField]},
            update: {
                ...current,
            },
            create: {
                ...current,
            },
        });
    });
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
