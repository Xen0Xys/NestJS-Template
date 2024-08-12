import {PrismaClient} from "@prisma/client";
import groupsFunction from "./seeds/groups.seed";
import usersFunction from "./seeds/users.seed";

// initialize Prisma Client
const prisma = new PrismaClient();

async function main(){
    const gStart = Date.now();

    let start = Date.now();
    await seed(prisma.group, groupsFunction());
    console.log("✅  User seed done ! (" + (Date.now() - start) + "ms)");

    start = Date.now();
    await seed(prisma.user, await usersFunction());
    console.log("✅  Todo list seed done ! (" + (Date.now() - start) + "ms)");

    console.log(`\n✅  Seeding completed ! (${Date.now() - gStart}ms)`);
}

async function seed(table: any, data: any[]){
    for(let i = 1; i <= data.length; i++){
        await table.upsert({
            where: {id: i},
            update: {
                ...data[i - 1],
            },
            create: {
                ...data[i - 1],
            },
        });
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
