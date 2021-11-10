import { OperationType } from '@/modules/statements/entities/Statement';
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '@/modules/users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '@/modules/users/useCases/createUser/ICreateUserDTO';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let fakeUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let fakeStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

let userData: ICreateUserDTO;
let depositData01: ICreateStatementDTO;
let depositData02: ICreateStatementDTO;
let withdrawData: ICreateStatementDTO;
let userId: string;

describe('Get User Balance', () => {
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
    getBalanceUseCase = new GetBalanceUseCase(
      fakeStatementsRepository,
      fakeUsersRepository
    );

    const { id } = await createUserUseCase.execute(userData);
    userId = id;

    depositData01.user_id = userId;
    depositData02.user_id = userId;
    withdrawData.user_id = userId;
  });

  it('should be able to get user account balance', async () => {
    const stt1 = await createStatementUseCase.execute(depositData01);
    const stt2 = await createStatementUseCase.execute(depositData02);
    const stt3 = await createStatementUseCase.execute(withdrawData);

    const balance = await getBalanceUseCase.execute({ user_id: userId });

    expect(balance.statement).toHaveLength(3);
    expect(balance).toEqual({
      statement: [
        expect.objectContaining(stt1),
        expect.objectContaining(stt2),
        expect.objectContaining(stt3),
      ],
      balance:
        depositData01.amount + depositData02.amount - withdrawData.amount,
    });
  });

  it('should not be able get balance from a non-existent user', async () => {
    async function getBalanceFromNonExistentUser() {
      await getBalanceUseCase.execute({ user_id: 'invalid_user_id' });
    }

    await expect(getBalanceFromNonExistentUser).rejects.toBeInstanceOf(
      GetBalanceError
    );

    await expect(getBalanceFromNonExistentUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      })
    );
  });
});
