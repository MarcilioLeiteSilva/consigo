import { PrismaClient, TenantStatus, PlatformRole, TenantUserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed da Plataforma SaaS...');

  // 1. Criar Administrador Global da Plataforma
  const adminPassword = await bcrypt.hash('admin123', 10);
  const platformAdmin = await prisma.platformAdmin.upsert({
    where: { email: 'admin@consigo.com' },
    update: {},
    create: {
      name: 'Admin Consigo',
      email: 'admin@consigo.com',
      passwordHash: adminPassword,
      role: PlatformRole.SUPER_ADMIN,
    },
  });
  console.log('✅ Admin Global criado: admin@consigo.com');

  // 2. Criar Planos de Assinatura
  const plans = [
    {
      name: 'Plano Bronze',
      price: 99.90,
      maxUsers: 3,
      maxPos: 1,
      maxProducts: 50,
      featuresJson: { support: 'email', reports: 'basic' },
    },
    {
      name: 'Plano Prata',
      price: 199.90,
      maxUsers: 10,
      maxPos: 5,
      maxProducts: 500,
      featuresJson: { support: 'whatsapp', reports: 'advanced' },
    },
    {
      name: 'Plano Ouro',
      price: 399.90,
      maxUsers: 99,
      maxPos: 20,
      maxProducts: 5000,
      featuresJson: { support: 'dedicated', reports: 'full' },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.name.toLowerCase().replace(' ', '-') }, // Mock ID for seed
      update: plan,
      create: {
        id: plan.name.toLowerCase().replace(' ', '-'),
        ...plan,
      },
    });
  }
  console.log('✅ Planos SaaS criados (Bronze, Prata, Ouro)');

  // 3. Criar um Tenant de Exemplo (Consignador)
  const tenantPassword = await bcrypt.hash('tenant123', 10);
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'consignador-exemplo' },
    update: {},
    create: {
      companyName: 'Consignador de Teste',
      slug: 'consignador-exemplo',
      email: 'contato@exemplo.com',
      status: TenantStatus.ACTIVE,
      users: {
        create: {
          name: 'Gerente Exemplo',
          email: 'gerente@exemplo.com',
          passwordHash: tenantPassword,
          role: TenantUserRole.TENANT_ADMIN,
        },
      },
      consignorAccount: {
        create: { balance: 0 }
      }
    },
  });
  console.log('✅ Tenant de exemplo criado: consignador-exemplo');

  // 4. Vincular o Tenant ao Plano Bronze
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planId: 'plano-bronze',
      status: 'active',
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
  });
  console.log('✅ Assinatura Bronze vinculada ao Tenant de exemplo');

  console.log('🚀 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
