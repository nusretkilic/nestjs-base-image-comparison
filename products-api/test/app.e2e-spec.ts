
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /
  it('GET / should return Hello World', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // POST /products
  it('POST /products should create a product', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      })
      .expect(201)
      .expect({
        id: 1,
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      });
  });

  // GET /products
  it('GET /products should return all products', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      })
      .expect(201);

    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect([
        {
          id: 1,
          name: 'Mechanical Keyboard',
          description: 'RGB mechanical keyboard',
          price: 99.99,
        },
      ]);
  });

  // GET /products/:id
  it('GET /products/:id should return a single product', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      })
      .expect(201);

    return request(app.getHttpServer())
      .get('/products/1')
      .expect(200)
      .expect({
        id: 1,
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      });
  });

  // GET /products/:id - 404
  it('GET /products/:id should return 404 when product does not exist', () => {
    return request(app.getHttpServer())
      .get('/products/999')
      .expect(404);
  });

  // PATCH /products/:id
  it('PATCH /products/:id should update a product', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      })
      .expect(201);

    return request(app.getHttpServer())
      .patch('/products/1')
      .send({
        name: 'Updated Mechanical Keyboard',
        price: 129.99,
      })
      .expect(200)
      .expect({
        id: 1,
        name: 'Updated Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 129.99,
      });
  });

  // PATCH /products/:id - 404
  it('PATCH /products/:id should return 404 when product does not exist', () => {
    return request(app.getHttpServer())
      .patch('/products/999')
      .send({
        name: 'Updated Product',
      })
      .expect(404);
  });

  // DELETE /products/:id
  it('DELETE /products/:id should delete a product', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 99.99,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete('/products/1')
      .expect(200);

    return request(app.getHttpServer())
      .get('/products/1')
      .expect(404);
  });

  // DELETE /products/:id - 404
  it('DELETE /products/:id should return 404 when product does not exist', () => {
    return request(app.getHttpServer())
      .delete('/products/999')
      .expect(404);
  });
});
