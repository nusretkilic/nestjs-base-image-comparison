import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private products: Product[] = [];
  private nextId = 1;

  create(createProductDto: CreateProductDto): Product {
    const product: Product = {
      id: this.nextId++,
      ...createProductDto,
    };

    this.products.push(product);
    this.logger.log(`Product created: id=${product.id}`);

    return product;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((item) => item.id === id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);

    Object.assign(product, updateProductDto);
    this.logger.log(`Product updated: id=${product.id}`);

    return product;
  }

  remove(id: number): void {
    const product = this.findOne(id);

    this.products = this.products.filter((item) => item.id !== product.id);
    this.logger.log(`Product deleted: id=${product.id}`);
  }
}

