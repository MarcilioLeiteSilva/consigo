import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { toDecimal } from '../../common/utils/money';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createProductDto: CreateProductDto) {
    const { categoryId, salePrice, commission, ...data } = createProductDto;
    
    const product = await this.prisma.product.create({
      data: {
        ...data,
        salePrice: toDecimal(salePrice),
        commission: commission ? toDecimal(commission) : null,
        tenantId,
        categoryId: categoryId || null,
      },
    });

    return product;
  }

  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
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
        salePrice: salePrice !== undefined ? toDecimal(salePrice) : undefined,
        commission: commission === undefined ? undefined : (commission ? toDecimal(commission) : null),
        categoryId: categoryId === undefined ? undefined : (categoryId || null),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
