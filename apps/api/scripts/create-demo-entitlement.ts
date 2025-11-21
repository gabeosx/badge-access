import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.entitlement.upsert({
        where: { name: 'Floor 2' },
        update: {},
        create: {
            name: 'Floor 2',
            description: 'Access to Floor 2',
        },
    });
    console.log('Created Floor 2 entitlement');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
