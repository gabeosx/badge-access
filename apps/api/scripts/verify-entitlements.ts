import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('Starting verification...');

    // 1. Setup Data
    const adminUsername = `admin_test_${Date.now()}`;
    const adminPassword = 'password123';
    const hash = await bcrypt.hash(adminPassword, 10);

    // Ensure ROLE_ADMIN entitlement exists
    let adminRole = await prisma.entitlement.findUnique({ where: { name: 'ROLE_ADMIN' } });
    if (!adminRole) {
        adminRole = await prisma.entitlement.create({ data: { name: 'ROLE_ADMIN', description: 'Administrator role' } });
    }

    // Create Admin User
    const admin = await prisma.user.create({
        data: {
            username: adminUsername,
            password_hash: hash,
            is_active: true,
            entitlements: {
                create: {
                    entitlement_id: adminRole.id
                }
            }
        }
    });

    console.log(`Created admin user: ${adminUsername}`);

    // Create a target user to assign entitlements to
    const targetUsername = `target_user_${Date.now()}`;
    const targetUser = await prisma.user.create({
        data: {
            username: targetUsername,
            password_hash: hash,
            is_active: true,
        }
    });
    console.log(`Created target user: ${targetUsername}`);

    // Create a test entitlement to assign
    const testEntitlementName = `TEST_BADGE_${Date.now()}`;
    const testEntitlement = await prisma.entitlement.create({
        data: { name: testEntitlementName, description: 'Test Badge' }
    });
    console.log(`Created test entitlement: ${testEntitlementName}`);

    // 2. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in successfully.');

    // 3. Assign Entitlement
    console.log('Assigning entitlement via API...');
    const assignRes = await fetch(`${API_URL}/api/users/${targetUsername}/entitlements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entitlementId: testEntitlement.id })
    });

    if (!assignRes.ok) {
        throw new Error(`Assignment failed: ${assignRes.status} ${await assignRes.text()}`);
    }
    console.log('Assignment API call successful.');

    // Verify in DB
    const checkAssignment = await prisma.userEntitlement.findUnique({
        where: {
            user_id_entitlement_id: {
                user_id: targetUser.id,
                entitlement_id: testEntitlement.id
            }
        }
    });

    if (!checkAssignment) {
        throw new Error('Verification failed: Entitlement not found in DB after assignment.');
    }
    console.log('Verification successful: Entitlement assigned.');

    // 4. Remove Entitlement
    console.log('Removing entitlement via API...');
    const removeRes = await fetch(`${API_URL}/api/users/${targetUsername}/entitlements/${testEntitlement.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!removeRes.ok) {
        throw new Error(`Removal failed: ${removeRes.status} ${await removeRes.text()}`);
    }
    console.log('Removal API call successful.');

    // Verify in DB
    const checkRemoval = await prisma.userEntitlement.findUnique({
        where: {
            user_id_entitlement_id: {
                user_id: targetUser.id,
                entitlement_id: testEntitlement.id
            }
        }
    });

    if (checkRemoval) {
        throw new Error('Verification failed: Entitlement still exists in DB after removal.');
    }
    console.log('Verification successful: Entitlement removed.');

    // Cleanup
    await prisma.user.delete({ where: { id: admin.id } });
    await prisma.user.delete({ where: { id: targetUser.id } });
    await prisma.entitlement.delete({ where: { id: testEntitlement.id } });
    // Don't delete ROLE_ADMIN as it might be used by others, or check if we created it. 
    // For safety, leave ROLE_ADMIN.

    console.log('Test passed!');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
