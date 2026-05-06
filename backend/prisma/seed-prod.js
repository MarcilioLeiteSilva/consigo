const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Setup de Produção (JS version)...');

  // 1. Criar o Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'consigo-prime' },
    update: {},
    create: {
      name: 'Consigo Prime',
      slug: 'consigo-prime',
      isActive: true,
    },
  });
  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.id})`);

  // 2. Criar Usuário Admin
  const hashedPassword = await bcrypt.hash('Cascavel88101', 10);
  const user = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@consigo.app'
      }
    },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: 'admin@consigo.app',
      passwordHash: hashedPassword,
      name: 'Administrador Consigo',
      role: 'ADMIN',
      tenantId: tenant.id,
      isActive: true,
    },
  });
  console.log(`✅ Usuário Admin criado: ${user.email}`);

  // 3. Criar um PDV padrão
  const posCount = await prisma.pOS.count({ where: { tenantId: tenant.id } });
  if (posCount === 0) {
    const pos = await prisma.pOS.create({
      data: {
        name: 'Caixa Central',
        tenantId: tenant.id,
      },
    });
    console.log(`✅ PDV criado: ${pos.name} (${pos.id})`);
  } else {
    console.log('ℹ️ PDV já existente.');
  }

  console.log('\n✨ Setup finalizado com sucesso! Use o e-mail admin@consigo.app e a senha Cascavel88101.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
