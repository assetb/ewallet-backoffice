import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';

// set env before importing config
process.env.PORT = '3000';
process.env.JWT_SECRET = 'secret';
process.env.PAYMENT_GATEWAY_BASE_URL = 'http://pg';
process.env.EWALLET_BASE_URL = 'http://wallet';
process.env.PAYMENT_GATEWAY_TOKEN = 'token_pg';
process.env.EWALLET_TOKEN = 'token_ew';

import { loginHandler } from '../src/controllers/authController';
import { FileService } from '../src/services/fileService';

jest.mock('../src/services/fileService');

const app = express();
app.use(express.json());
app.post('/login', loginHandler);

describe('POST /login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('returns token for valid credentials', async () => {
    const password = 'pass';
    const hash = await bcrypt.hash(password, 1);
    jest
      .spyOn(FileService, 'getAllUsers')
      .mockResolvedValue([`1;user;${hash};finance`]);

    const res = await request(app)
      .post('/login')
      .send({ login: 'user', password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.login).toBe('user');
  });

  test('returns 401 for wrong password', async () => {
    const hash = await bcrypt.hash('correct', 1);
    jest
      .spyOn(FileService, 'getAllUsers')
      .mockResolvedValue([`1;user;${hash};finance`]);

    const res = await request(app)
      .post('/login')
      .send({ login: 'user', password: 'wrong' });

    expect(res.status).toBe(401);
  });
});
