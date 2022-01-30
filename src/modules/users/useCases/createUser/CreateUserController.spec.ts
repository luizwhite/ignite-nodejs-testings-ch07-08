import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '@/app';
import createConnection from '@/database';

import { ICreateUserDTO } from './ICreateUserDTO';

let connection: Connection;
let userData: ICreateUserDTO;

const apiVersion = '/api/v1';

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should return a status code 201 when successfully create a new user', async () => {
    const userCreatedResponse = await request(app)
      .post(`${apiVersion}/users`)
      .send(userData);

    expect(userCreatedResponse.status).toBe(201);
  });

  it('should return a status code 400 when trying to create a user with an already registered email', async () => {
    await request(app).post(`${apiVersion}/users`).send(userData);

    const userCreatedResponse = await request(app)
      .post(`${apiVersion}/users`)
      .send(userData);

    expect(userCreatedResponse.status).toBe(400);
  });
});
