import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';

import { CreateUserUseCase } from './CreateUserUseCase';
import { ICreateUserDTO } from './ICreateUserDTO';

let createUserUseCase: CreateUserUseCase;
let fakeUsersRepository: InMemoryUsersRepository;

let userData: ICreateUserDTO;
let uuidv4Regex: RegExp;

describe('Create User', () => {
  beforeAll(() => {
    userData = {
      name: 'User Name',
      email: 'test@test.com',
      password: 'abc123',
    };

    uuidv4Regex = new RegExp(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/,
      'i'
    );
  });

  beforeEach(async () => {
    fakeUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(fakeUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const userCreated = await createUserUseCase.execute(userData);

    expect(userCreated).toEqual({
      id: expect.stringMatching(uuidv4Regex),
      name: userData.name,
      email: userData.email,
      password: expect.any(String),
    });
  });
});
