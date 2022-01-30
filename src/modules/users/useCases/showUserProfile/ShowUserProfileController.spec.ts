import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '@/app';
import authConfig from '@/config/auth';
import createConnection from '@/database';

import { User } from '../../entities/User';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';

interface IAuthUserDTO {
  email: string;
  password: string;
}

let connection: Connection;
let userData: ICreateUserDTO;
let userAuthData: IAuthUserDTO;
let userToken: string;
let uuidv4Regex: RegExp;

const apiVersion = '/api/v1';

describe('Show User Profile Controller', () => {
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
    const { body: authData } = await request(app)
      .post(`${apiVersion}/sessions`)
      .send(userAuthData);
    userToken = authData.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show a valid user profile with a returned status code 200', async () => {
    const { name, email } = userData;

    const showProfileResponse = await request(app)
      .get(`${apiVersion}/profile`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    expect(showProfileResponse.status).toBe(200);
    expect(showProfileResponse.body).toEqual({
      id: expect.stringMatching(uuidv4Regex),
      name,
      email,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    expect(new Date(showProfileResponse.body.created_at)).toBeTruthy();
    expect(new Date(showProfileResponse.body.updated_at)).toBeTruthy();
  });

  it('should not be able to show an user profile with an invalid token returning a status code 401', async () => {
    const invalidUser = new User();

    const invalidUserToken = sign({ invalidUser }, 'invalid_secret', {
      subject: invalidUser.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    const showProfileResponse = await request(app)
      .get(`${apiVersion}/profile`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      });

    expect(showProfileResponse.status).toBe(401);
  });

  it('should not be able to show a profile of a non-existent user returning a status code 404', async () => {
    const invalidUser = new User();

    const invalidUserToken = sign({ invalidUser }, authConfig.jwt.secret, {
      subject: invalidUser.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    const showProfileResponse = await request(app)
      .get(`${apiVersion}/profile`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      });

    expect(showProfileResponse.status).toBe(404);
  });
});
