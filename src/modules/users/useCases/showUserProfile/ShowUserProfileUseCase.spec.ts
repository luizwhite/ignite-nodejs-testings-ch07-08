import { InMemoryUsersRepository } from '@/modules/users/repositories/in-memory/InMemoryUsersRepository';

import { User } from '../../entities/User';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;
let fakeUsersRepository: InMemoryUsersRepository;

let userData: ICreateUserDTO;
let userId: string;
let uuidv4Regex: RegExp;

describe('Show User Profile', () => {
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
    showUserProfileUseCase = new ShowUserProfileUseCase(fakeUsersRepository);

    const { id } = await createUserUseCase.execute(userData);
    userId = id;
  });

  it('should be able to show the user profile', async () => {
    const { name, email } = userData;

    const userProfile = await showUserProfileUseCase.execute(userId);

    expect(userProfile).toBeInstanceOf(User);
    expect(userProfile).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(uuidv4Regex),
        name,
        email,
      })
    );
  });

  it('should not be able to show a profile of a non-existent user', async () => {
    async function showProfileNonExistentUser() {
      await showUserProfileUseCase.execute('invalid_id');
    }

    await expect(showProfileNonExistentUser).rejects.toBeInstanceOf(
      ShowUserProfileError
    );
    await expect(showProfileNonExistentUser).rejects.toEqual(
      expect.objectContaining({
        statusCode: 404,
        message: 'User not found',
      })
    );
  });
});
