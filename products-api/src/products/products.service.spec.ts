
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', () => {
      const product = service.create({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      });

      expect(product).toEqual({
        id: 1,
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      });
    });

    it('should assign incremental IDs', () => {
      const firstProduct = service.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });

      const secondProduct = service.create({
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 49.99,
      });

      expect(firstProduct.id).toBe(1);
      expect(secondProduct.id).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should return all products', () => {
      service.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });

      service.create({
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 49.99,
      });

      expect(service.findAll()).toHaveLength(2);
    });

    it('should return an empty array when no products exist', () => {
      expect(service.findAll()).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', () => {
      service.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });

      expect(service.findOne(1)).toEqual({
        id: 1,
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });
    });

    it('should throw NotFoundException when product does not exist', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', () => {
      service.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });

      const updatedProduct = service.update(1, {
        name: 'Updated Keyboard',
        price: 129.99,
      });

      expect(updatedProduct).toEqual({
        id: 1,
        name: 'Updated Keyboard',
        description: 'Mechanical keyboard',
        price: 129.99,
      });
    });

    it('should throw NotFoundException when product does not exist', () => {
      expect(() =>
        service.update(999, {
          name: 'Updated Product',
        }),
      ).toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', () => {
      service.create({
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: 99.99,
      });

      service.remove(1);

      expect(service.findAll()).toEqual([]);
    });

    it('should throw NotFoundException when product does not exist', () => {
      expect(() => service.remove(999)).toThrow(NotFoundException);
    });
  });
});
