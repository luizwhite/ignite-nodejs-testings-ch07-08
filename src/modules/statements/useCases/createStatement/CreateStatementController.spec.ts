import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '@/app';
import authConfig from '@/config/auth';
import createConnection from '@/database';
import { User } from '@/modules/users/entities/User';
import { ICreateUserDTO } from '@/modules/users/useCases/createUser/ICreateUserDTO';

import { OperationType } from '../../entities/Statement';
import { ICreateStatementDTO } from './ICreateStatementDTO';

interface IAuthUserDTO {
  email: string;
  password: string;
}

let connection: Connection;
let userData: ICreateUserDTO;
let userAuthData: IAuthUserDTO;
let userToken: string;
let userId: string;
let depositData: ICreateStatementDTO;
let withdrawData: ICreateStatementDTO;
let uuidv4Regex: RegExp;

const apiVersion = '/api/v1';

describe('Create Statement Controller', () => {
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

    const { body: userProfile } = await request(app)
      .get(`${apiVersion}/profile`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });
    userId = userProfile.id;

    depositData = {
      amount: 150,
      description: 'Deposit statement',
      type: OperationType.DEPOSIT,
      user_id: userId,
    };

    withdrawData = {
      amount: 100,
      description: 'Withdraw statement',
      type: OperationType.WITHDRAW,
      user_id: userId,
    };
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a statement with a returned status code 201', async () => {
    let createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${userToken}`,
      })
      .send(depositData);

    expect(createStatementResponse.status).toBe(201);
    expect(createStatementResponse.body).toEqual({
      ...depositData,
      id: expect.stringMatching(uuidv4Regex),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    expect(new Date(createStatementResponse.body.created_at)).toBeTruthy();
    expect(new Date(createStatementResponse.body.updated_at)).toBeTruthy();

    createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/withdraw`)
      .set({
        Authorization: `Bearer ${userToken}`,
      })
      .send(withdrawData);

    expect(createStatementResponse.status).toBe(201);
    expect(createStatementResponse.body).toEqual({
      ...withdrawData,
      id: expect.stringMatching(uuidv4Regex),
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    expect(new Date(createStatementResponse.body.created_at)).toBeTruthy();
    expect(new Date(createStatementResponse.body.updated_at)).toBeTruthy();
  });

  it('should not be able to create a statement with an invalid token returning a status code 401', async () => {
    const invalidUser = new User();

    const invalidUserToken = sign({ invalidUser }, 'invalid_secret', {
      subject: invalidUser.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    let createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      })
      .send(depositData);

    expect(createStatementResponse.status).toBe(401);

    createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/withdraw`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      })
      .send(withdrawData);

    expect(createStatementResponse.status).toBe(401);
  });

  it('should not be able to create a statement of a non-existent user returning a status code 404', async () => {
    const invalidUser = new User();

    const invalidUserToken = sign({ invalidUser }, authConfig.jwt.secret, {
      subject: invalidUser.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    let createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      })
      .send(depositData);

    expect(createStatementResponse.status).toBe(404);

    createStatementResponse = await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${invalidUserToken}`,
      })
      .send(withdrawData);

    expect(createStatementResponse.status).toBe(404);
  });
});
