import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PharmaWorld API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/GET health - should return status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });

    it('/GET health - should include database status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('Authentication', () => {
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@pharmaworld.com',
      password: 'Test@12345',
      phone: '+919876543210',
      role: 'customer',
    };

    it('/POST auth/register - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user).toHaveProperty('_id');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
          userId = res.body.user._id;
        });
    });

    it('/POST auth/register - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('/POST auth/register - should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'invalidemail' })
        .expect(400);
    });

    it('/POST auth/login - should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
        });
    });

    it('/POST auth/login - should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('/GET auth/profile - should return user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('/GET auth/profile - should fail without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });
  });

  describe('Medicines', () => {
    let medicineId: string;

    const testMedicine = {
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      description: 'Pain relief tablets',
      price: 25.00,
      mrp: 30.00,
      stock: 100,
      category: 'Pain Relief',
      manufacturer: 'Test Pharma',
      dosage: '500mg',
      form: 'tablet',
      requiresPrescription: false,
    };

    it('/POST medicines - should create a medicine (admin)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/medicines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testMedicine)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe(testMedicine.name);
          expect(res.body._id).toBeDefined();
          medicineId = res.body._id;
        });
    });

    it('/GET medicines - should return all medicines', () => {
      return request(app.getHttpServer())
        .get('/api/v1/medicines')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });

    it('/GET medicines/:id - should return a single medicine', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/medicines/${medicineId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(medicineId);
          expect(res.body.name).toBe(testMedicine.name);
        });
    });

    it('/GET medicines/:id - should return 404 for non-existent', () => {
      return request(app.getHttpServer())
        .get('/api/v1/medicines/507f1f77bcf86cd799439011')
        .expect(404);
    });

    it('/PUT medicines/:id - should update a medicine', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/medicines/${medicineId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 22.00, stock: 150 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(22.00);
          expect(res.body.stock).toBe(150);
        });
    });

    it('/DELETE medicines/:id - should delete a medicine', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/medicines/${medicineId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('/GET medicines?search= - should search medicines', () => {
      return request(app.getHttpServer())
        .get('/api/v1/medicines?search=paracetamol')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Cart', () => {
    it('/POST cart/add - should add item to cart', () => {
      return request(app.getHttpServer())
        .post('/api/v1/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ medicineId: '507f1f77bcf86cd799439011', quantity: 2 })
        .expect(201);
    });

    it('/GET cart - should get user cart', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('totalAmount');
        });
    });

    it('/POST cart/add - should fail without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/cart/add')
        .send({ medicineId: '507f1f77bcf86cd799439011', quantity: 1 })
        .expect(401);
    });
  });

  describe('Orders', () => {
    it('/POST orders - should create an order', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          addressId: '507f1f77bcf86cd799439011',
          paymentMethod: 'cod',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('orderId');
          expect(res.body.status).toBe('pending');
        });
    });

    it('/GET orders - should get user orders', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Coupons', () => {
    it('/POST coupons/validate - should validate a coupon', () => {
      return request(app.getHttpServer())
        .post('/api/v1/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'WELCOME10', orderAmount: 500 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('discount');
          expect(res.body).toHaveProperty('valid');
        });
    });

    it('/POST coupons/validate - should reject invalid coupon', () => {
      return request(app.getHttpServer())
        .post('/api/v1/coupons/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ code: 'INVALIDCODE', orderAmount: 500 })
        .expect(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/nonexistent')
        .expect(404);
    });

    it('should return 400 for invalid request body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ invalid: true })
        .expect(400);
    });
  });
});
