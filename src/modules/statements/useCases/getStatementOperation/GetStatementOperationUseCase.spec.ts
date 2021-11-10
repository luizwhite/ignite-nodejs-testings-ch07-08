import {
  OperationType,
  Statement,
} from '@/modules/statements/entities/Statement';
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '@/modules/users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '@/modules/users/useCases/createUser/ICreateUserDTO';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let fakeUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let fakeStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

let userData: ICreateUserDTO;
let depositData01: ICreateStatementDTO;
let depositData02: ICreateStatementDTO;
let withdrawData: ICreateStatementDTO;
let stt1: Statement;
let stt2: Statement;
let stt3: Statement;
let userId: string;

describe('Get Statement Operation', () => {
  beforeAll(() => {
    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };

    depositData01 = {
      amount: 150,
      description: 'Deposit statement 01',
      type: OperationType.DEPOSIT,
      user_id: '',
    };

    depositData02 = {
      amount: 70,
      description: 'Deposit statement 02',
      type: OperationType.DEPOSIT,
      user_id: '',
    };

    withdrawData = {
      amount: 100,
      description: 'Withdraw statement',
      type: OperationType.WITHDRAW,
      user_id: '',
    };
  });

  beforeEach(async () => {
    fakeUsersRepository = new InMemoryUsersRepository();
    fakeStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(fakeUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      fakeUsersRepository,
      fakeStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      fakeUsersRepository,
      fakeStatementsRepository
    );

    const { id } = await createUserUseCase.execute(userData);
    userId = id;

    depositData01.user_id = userId;
    depositData02.user_id = userId;
    withdrawData.user_id = userId;

    stt1 = await createStatementUseCase.execute(depositData01);
    stt2 = await createStatementUseCase.execute(depositData02);
    stt3 = await createStatementUseCase.execute(withdrawData);
  });

  it('should be able to get a statement by id', async () => {
    const user_id = userId;
    let statement_id = stt1.id;

    const stt1Found = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });
    expect(stt1Found).toEqual(expect.objectContaining(stt1));

    statement_id = stt2.id;
    const stt2Found = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });
    expect(stt2Found).toEqual(expect.objectContaining(stt2));

    statement_id = stt3.id;
    const stt3Found = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });
    expect(stt3Found).toEqual(expect.objectContaining(stt3));
  });

  it('should not be able to get a statement of a non-existent user', async () => {
    const statement_id = stt1.id;

    async function getStatementNonExistentUser() {
      await getStatementOperationUseCase.execute({
        user_id: 'invalid_user_id',
        statement_id,
      });
    }

    await expect(getStatementNonExistentUser).rejects.toBeInstanceOf(
      GetStatementOperationError.UserNotFound
    );

    await expect(getStatementNonExistentUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      })
    );
  });

  it('should not be able to get a non-existent statement', async () => {
    const user_id = userId;

    async function getNonExistentStatement() {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'invalid_statement_id',
      });
    }

    await expect(getNonExistentStatement).rejects.toBeInstanceOf(
      GetStatementOperationError.StatementNotFound
    );

    await expect(getNonExistentStatement).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'Statement not found',
      })
    );
  });
});
