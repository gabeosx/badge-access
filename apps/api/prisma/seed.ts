import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Entitlements
    const entitlements = [
        { name: 'ROLE_ADMIN', description: 'Administrator Role' },
        { name: 'ROLE_END_USER', description: 'Standard User Role' },
        { name: 'Lobby', description: 'Access to Lobby' },
        { name: 'Floor 1', description: 'Access to Floor 1' },
    ];

    for (const ent of entitlements) {
        await prisma.entitlement.upsert({
            where: { name: ent.name },
            update: {},
            create: ent,
        });
    }

    // 2. Create Users
    const passwordHash = await bcrypt.hash('admin', 10); // Default password for admin
    const userPasswordHash = await bcrypt.hash('user', 10); // Default password for user

    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password_hash: passwordHash,
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@example.com',
        },
    });

    const normalUser = await prisma.user.upsert({
        where: { username: 'user' },
        update: {},
        create: {
            username: 'user',
            password_hash: userPasswordHash,
            first_name: 'Normal',
            last_name: 'User',
            email: 'user@example.com',
        },
    });

    // 3. Assign Entitlements
    // Admin gets everything
    const allEntitlements = await prisma.entitlement.findMany();
    for (const ent of allEntitlements) {
        await prisma.userEntitlement.upsert({
            where: {
                user_id_entitlement_id: {
                    user_id: adminUser.id,
                    entitlement_id: ent.id,
                },
            },
            update: {},
            create: {
                user_id: adminUser.id,
                entitlement_id: ent.id,
            },
        });
    }

    // User gets ROLE_END_USER and Lobby
    const userEntitlements = allEntitlements.filter((e) =>
        ['ROLE_END_USER', 'Lobby'].includes(e.name)
    );
    for (const ent of userEntitlements) {
        await prisma.userEntitlement.upsert({
            where: {
                user_id_entitlement_id: {
                    user_id: normalUser.id,
                    entitlement_id: ent.id,
                },
            },
            update: {},
            create: {
                user_id: normalUser.id,
                entitlement_id: ent.id,
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
