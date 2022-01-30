import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '@/app';
import createConnection from '@/database';

import { ICreateUserDTO } from '../createUser/ICreateUserDTO';

interface IAuthUserDTO {
  email: string;
  password: string;
}

let connection: Connection;
let userData: ICreateUserDTO;
let userAuthData: IAuthUserDTO;
let uuidv4Regex: RegExp;

const apiVersion = '/api/v1';

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };
    userAuthData = (({ email, password }) => ({ email, password }))(userData);

    uuidv4Regex = new RegExp(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
      'i'
    );

    await request(app).post(`${apiVersion}/users`).send(userData);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate a valid user login with a returned status code 200', async () => {
    const { name, email } = userData;

    const userAuthResponse = await request(app)
      .post(`${apiVersion}/sessions`)
      .send(userAuthData);

    expect(userAuthResponse.status).toBe(200);
    expect(userAuthResponse.body).toEqual({
      user: {
        id: expect.stringMatching(uuidv4Regex),
        name,
        email,
      },
      token: expect.any(String),
    });
  });

  it('should not be able to authenticate an invalid user returning a status code 401', async () => {
    const userWrongAuthResponse = await request(app)
      .post(`${apiVersion}/sessions`)
      .send({ email: 'invalid_user_email', password: userAuthData.password });

    expect(userWrongAuthResponse.status).toBe(401);
  });

  it('should not be able to authenticate an user with an invalid password returning a status code 401', async () => {
    const userWrongAuthResponse = await request(app)
      .post(`${apiVersion}/sessions`)
      .send({ email: userAuthData.email, password: 'invalid_user_password' });

    expect(userWrongAuthResponse.status).toBe(401);
  });
});
