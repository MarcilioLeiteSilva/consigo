import { PrismaClient, TenantStatus, TenantUserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Setup de Produção...');

  // 1. Criar o Tenant (Loja) usando o slug como chave única
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'consigo-prime' },
    update: {},
    create: {
      companyName: 'Consigo Prime',
      email: 'admin@consigo.app', // Adicionado campo obrigatório
      slug: 'consigo-prime',
      status: TenantStatus.ACTIVE,
      consignorAccount: {
        create: { balance: 0 }
      }
    },
  });
  console.log(`✅ Tenant criado: ${tenant.companyName} (${tenant.id})`);

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
      role: TenantUserRole.TENANT_ADMIN,
      tenantId: tenant.id,
      isActive: true,
    },
  });
  console.log(`✅ Usuário Admin criado: ${user.email}`);

  // 3. Criar um PDV padrão
  const pos = await prisma.pOS.create({
    data: {
      name: 'Caixa Central',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ PDV criado: ${pos.name} (${pos.id})`);

  console.log('\n✨ Setup finalizado com sucesso! Agora você pode logar no App e no Web.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
