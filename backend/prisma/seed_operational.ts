import { PrismaClient, TransactionType, FinancialReferenceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Buscar o Tenant (usaremos o slug que criamos no teste ou o exemplo)
  const tenant = await prisma.tenant.findFirst({
    where: { OR: [{ slug: 'teste-antigravity' }, { slug: 'consignador-exemplo' }] }
  });

  if (!tenant) {
    console.error('❌ Tenant não encontrado. Por favor, crie uma conta primeiro.');
    return;
  }

  console.log(`🌱 Populando dados reais para o Tenant: ${tenant.companyName}`);

  // 2. Criar Categorias
  const cat3d = await prisma.category.create({ data: { name: 'Colecionáveis 3D', tenantId: tenant.id } });
  const catPkg = await prisma.category.create({ data: { name: 'Produtos Embalados', tenantId: tenant.id } });

  // 3. Criar Produtos 3D
  const products3d = [
    { name: 'Busto Batman (Cinza)', sku: '3D-BAT-01', price: 149.90 },
    { name: 'Suporte Headset Mão Robo', sku: '3D-SUP-02', price: 89.00 },
    { name: 'Vaso Poligonal Low-Poly', sku: '3D-VAS-03', price: 45.00 },
    { name: 'Articulado Dragão Cristal', sku: '3D-DRG-04', price: 120.00 },
    { name: 'Miniatura RPG Guerreiro', sku: '3D-RPG-05', price: 25.00 },
    { name: 'Organizador de Mesa Darth Vader', sku: '3D-ORG-06', price: 110.00 },
    { name: 'Chaveiro QR Code Custom', sku: '3D-CHV-07', price: 15.00 },
  ];

  // 4. Criar Produtos Embalados
  const productsPkg = [
    { name: 'Caixa de Som Retro BT', sku: 'PKG-SND-01', price: 299.00 },
    { name: 'Luminária Cubo Mágico', sku: 'PKG-LUM-02', price: 159.00 },
    { name: 'Kit Canecas Star Wars', sku: 'PKG-CAN-03', price: 89.90 },
    { name: 'Mouse Pad Gamer XL', sku: 'PKG-PAD-04', price: 75.00 },
    { name: 'Agenda Planner 2026', sku: 'PKG-PLN-05', price: 65.00 },
    { name: 'Garrafa Térmica Digital', sku: 'PKG-BOT-06', price: 129.00 },
  ];

  // Inserir Produtos
  const saved3d = await Promise.all(products3d.map(p => 
    prisma.product.create({ data: { ...p, salePrice: p.price, tenantId: tenant.id, categoryId: cat3d.id } })
  ));

  const savedPkg = await Promise.all(productsPkg.map(p => 
    prisma.product.create({ data: { ...p, salePrice: p.price, tenantId: tenant.id, categoryId: catPkg.id } })
  ));

  // 5. Criar Pontos de Venda (PDVs)
  const pdvs = [
    { name: 'Lab 3D Central', location: 'Rua das Inovações, 100' },
    { name: 'Quiosque Geek Plaza', location: 'Shopping Plaza - Piso 2' },
    { name: 'Showroom Tech', location: 'Av. Paulista, 1500' },
    { name: 'Loja Conveniência Sul', location: 'Posto Shell Sul' },
    { name: 'Empório de Presentes', location: 'Bairro Jardim, 50' },
  ];

  const savedPdvs = await Promise.all(pdvs.map(p => 
    prisma.pOS.create({ data: { ...p, tenantId: tenant.id } })
  ));

  // 6. Distribuir Estoque (Snapshots)
  console.log('📦 Distribuindo estoque inicial...');
  
  // PDVs 3D (Primeiros 3)
  for (let i = 0; i < 3; i++) {
    for (const prod of saved3d) {
      await prisma.stockSnapshot.create({
        data: {
          tenantId: tenant.id,
          posId: savedPdvs[i].id,
          productId: prod.id,
          quantity: Math.floor(Math.random() * 10) + 5
        }
      });
    }
  }

  // PDVs Embalados (Últimos 2)
  for (let i = 3; i < 5; i++) {
    for (const prod of savedPkg) {
      await prisma.stockSnapshot.create({
        data: {
          tenantId: tenant.id,
          posId: savedPdvs[i].id,
          productId: prod.id,
          quantity: Math.floor(Math.random() * 20) + 10
        }
      });
    }
  }

  console.log('✅ Dados Operacionais carregados com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
