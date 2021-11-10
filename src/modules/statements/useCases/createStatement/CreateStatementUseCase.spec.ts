import {
  OperationType,
  Statement,
} from '@/modules/statements/entities/Statement';
import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '@/modules/users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '@/modules/users/useCases/createUser/ICreateUserDTO';

import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { ICreateStatementDTO } from './ICreateStatementDTO';

let fakeUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let fakeStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let userData: ICreateUserDTO;
let depositData: ICreateStatementDTO;
let withdrawData: ICreateStatementDTO;
let userId: string;
let uuidv4Regex: RegExp;

describe('Authenticate User', () => {
  beforeAll(() => {
    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };

    depositData = {
      amount: 150,
      description: 'Deposit statement',
      type: OperationType.DEPOSIT,
      user_id: '',
    };

    withdrawData = {
      amount: 100,
      description: 'Withdraw statement',
      type: OperationType.WITHDRAW,
      user_id: '',
    };

    uuidv4Regex = new RegExp(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
      'i'
    );
  });

  beforeEach(async () => {
    fakeUsersRepository = new InMemoryUsersRepository();
    fakeStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(fakeUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      fakeUsersRepository,
      fakeStatementsRepository
    );

    const { id } = await createUserUseCase.execute(userData);
    userId = id;

    depositData.user_id = userId;
    withdrawData.user_id = userId;
  });

  it('should be able to deposit an amount', async () => {
    const successfulDeposit = await createStatementUseCase.execute(depositData);

    expect(successfulDeposit).toBeInstanceOf(Statement);
    expect(successfulDeposit).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(uuidv4Regex),
        ...depositData,
      })
    );
  });

  it('should be able to withdraw an amount', async () => {
    await createStatementUseCase.execute(depositData);

    const successfulWithdraw = await createStatementUseCase.execute(
      withdrawData
    );

    expect(successfulWithdraw).toBeInstanceOf(Statement);
    expect(successfulWithdraw).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(uuidv4Regex),
        ...withdrawData,
      })
    );
  });

  it('should not be able to create a statement for a non-existent user', async () => {
    async function createDepositStatementForNonExistentUser() {
      await createStatementUseCase.execute({
        ...depositData,
        user_id: 'invalid_user_id',
      });
    }

    async function createWithdrawStatementForNonExistentUser() {
      await createStatementUseCase.execute({
        ...withdrawData,
        user_id: 'invalid_user_id',
      });
    }

    await expect(
      createDepositStatementForNonExistentUser
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    await expect(
      createWithdrawStatementForNonExistentUser
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

    await expect(createDepositStatementForNonExistentUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      })
    );
    await expect(createWithdrawStatementForNonExistentUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      })
    );
  });

  it('should not be able to create a withdraw statement with insufficient funds', async () => {
    async function withdrawWithInsufficientFunds() {
      await createStatementUseCase.execute(withdrawData);
    }

    await expect(withdrawWithInsufficientFunds).rejects.toBeInstanceOf(
      CreateStatementError.InsufficientFunds
    );

    await expect(withdrawWithInsufficientFunds).rejects.toEqual(
      expect.objectContaining({
        statusCode: 400,
        message: 'Insufficient funds',
      })
    );
  });
});
