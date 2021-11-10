import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

interface IAuthUserDTO {
  email: string;
  password: string;
}

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let fakeUsersRepository: InMemoryUsersRepository;

let userData: ICreateUserDTO;
let userAuthData: IAuthUserDTO;
let uuidv4Regex: RegExp;

describe('Authenticate User', () => {
  beforeAll(() => {
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
  });

  beforeEach(async () => {
    fakeUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(fakeUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(fakeUsersRepository);

    await createUserUseCase.execute(userData);
  });

  it('should be able to authenticate a valid user login', async () => {
    const { name, email } = userData;

    const userAuthenticated = await authenticateUserUseCase.execute(
      userAuthData
    );

    expect(userAuthenticated).toEqual({
      user: {
        id: expect.stringMatching(uuidv4Regex),
        name,
        email,
      },
      token: expect.any(String),
    });
  });

  it('should not be able to authenticate an invalid user', async () => {
    async function authInvalidUser() {
      await authenticateUserUseCase.execute({
        email: 'invalidUser Email',
        password: 'invalidUser Password',
      });
    }

    await expect(authInvalidUser).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
    await expect(authInvalidUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'Incorrect email or password',
      })
    );
  });

  it('should not be able to authenticate an user with an invalid password', async () => {
    const { email } = userAuthData;

    async function authInvalidUser() {
      await authenticateUserUseCase.execute({
        email,
        password: 'invalidUser Password',
      });
    }

    await expect(authInvalidUser).rejects.toBeInstanceOf(
      IncorrectEmailOrPasswordError
    );
    await expect(authInvalidUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 401,
        message: 'Incorrect email or password',
      })
    );
  });
});
