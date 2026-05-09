import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { toPrismaDecimal } from '../../common/utils/prisma-decimal';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createProductDto: CreateProductDto) {
    const { categoryId, salePrice, commission, ...data } = createProductDto;
    
    const product = await this.prisma.product.create({
      data: {
        ...data,
        salePrice: toPrismaDecimal(salePrice),
        commission: commission ? toPrismaDecimal(commission) : null,
        tenantId,
        categoryId: categoryId || null,
      },
    });

    return product;
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { 
        tenantId,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(tenantId: string, id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    const { categoryId, salePrice, commission, ...data } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        salePrice: salePrice !== undefined ? toPrismaDecimal(salePrice) : undefined,
        commission: commission === undefined ? undefined : (commission ? toPrismaDecimal(commission) : null),
        categoryId: categoryId === undefined ? undefined : (categoryId || null),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const product = await this.findOne(tenantId, id);

    // Check for dependencies that prevent hard delete
    const [hasSales, hasLots] = await Promise.all([
      this.prisma.saleItem.findFirst({ where: { productId: id } }),
      this.prisma.consignmentLot.findFirst({ where: { productId: id } }),
    ]);

    if (hasSales || hasLots) {
      // If there's history, perform a soft delete
      return this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // If no sales or lots, we can perform a hard delete.
    // First, remove dependent stock snapshots (temporal data)
    await this.prisma.stockSnapshot.deleteMany({
      where: { productId: id },
    });

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
