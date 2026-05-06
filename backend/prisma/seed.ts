import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Criar Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'consigo-admin' },
    update: {},
    create: {
      name: 'Consigo Master',
      slug: 'consigo-admin',
    },
  });

  // 2. Criar Admin User
  const adminEmail = 'admin@consigo.com';
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: {},
    create: {
      email: adminEmail,
      name: 'Super Admin',
      passwordHash,
      role: Role.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Seed completed!');
  console.log('User: admin@consigo.com');
  console.log('Pass: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
