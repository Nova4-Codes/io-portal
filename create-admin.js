const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const saltRounds = 10;

// Admin credentials - you can change these as needed
const adminEmail = 'admin@inuaai.com';
const adminPassword = 'admin123'; // Change this to a secure password in production

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. User ID: ${existingAdmin.id}`); // Log existing admin ID
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: passwordHash,
        role: 'ADMIN',
        agreedPolicies: '[]', // Empty JSON array as string for SQLite
        completedTools: '[]', // Empty JSON array as string for SQLite
      }
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`User ID: ${admin.id}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();