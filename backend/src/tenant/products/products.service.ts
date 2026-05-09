import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapProduct(product: any) {
    if (!product) return null;
    return {
      ...product,
      salePrice: Number(product.salePrice || 0),
      commission: product.commission ? Number(product.commission) : 0,
    };
  }

  async create(tenantId: string, createProductDto: CreateProductDto) {
    const { categoryId, salePrice, commission, ...data } = createProductDto;
    
    const product = await this.prisma.product.create({
      data: {
        ...data,
        salePrice: Number(salePrice),
        commission: commission ? Number(commission) : null,
        tenantId,
        categoryId: categoryId || null,
      },
    });

    return this.mapProduct(product);
  }

  async findAll(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => this.mapProduct(p));
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

    return this.mapProduct(product);
  }

  async update(tenantId: string, id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(tenantId, id);
    const { categoryId, salePrice, commission, ...data } = updateProductDto;

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(salePrice !== undefined && { salePrice: Number(salePrice) }),
        ...(commission !== undefined && { commission: commission !== null ? Number(commission) : null }),
        categoryId: categoryId === undefined ? undefined : (categoryId || null),
      },
    });

    return this.mapProduct(updated);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
