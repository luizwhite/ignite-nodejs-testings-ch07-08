import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '@/app';
import createConnection from '@/database';
import { ICreateUserDTO } from '@/modules/users/useCases/createUser/ICreateUserDTO';

import { OperationType } from '../../entities/Statement';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

interface IAuthUserDTO {
  email: string;
  password: string;
}

let connection: Connection;
let userData: ICreateUserDTO;
let userAuthData: IAuthUserDTO;
let userToken: string;
let userId: string;
let depositData_01: ICreateStatementDTO;
let depositData_02: ICreateStatementDTO;
let withdrawData: ICreateStatementDTO;

const apiVersion = '/api/v1';

describe('Create Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };
    userAuthData = (({ email, password }) => ({ email, password }))(userData);

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

    depositData_01 = {
      amount: 150,
      description: 'Deposit statement 01',
      type: OperationType.DEPOSIT,
      user_id: userId,
    };

    depositData_02 = {
      amount: 70,
      description: 'Deposit statement 02',
      type: OperationType.DEPOSIT,
      user_id: userId,
    };

    withdrawData = {
      amount: 100,
      description: 'Withdraw statement',
      type: OperationType.WITHDRAW,
      user_id: userId,
    };

    await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${userToken}`,
      })
      .send(depositData_01);

    await request(app)
      .post(`${apiVersion}/statements/deposit`)
      .set({
        Authorization: `Bearer ${userToken}`,
      })
      .send(depositData_02);

    await request(app)
      .post(`${apiVersion}/statements/withdraw`)
      .set({
        Authorization: `Bearer ${userToken}`,
      })
      .send(withdrawData);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get user account balance with a returned status code 200', async () => {
    const balanceResponse = await request(app)
      .get(`${apiVersion}/statements/balance`)
      .set({
        Authorization: `Bearer ${userToken}`,
      });

    const { status, body: balanceData } = balanceResponse;

    expect(status).toBe(200);
    expect(balanceData.balance).toBe(
      depositData_01.amount + depositData_02.amount - withdrawData.amount
    );
  });
});
