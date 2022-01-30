import {
  createConnection as createConnectionBase,
  getConnectionOptions,
} from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type createConnectionPostgres = (
  options: PostgresConnectionOptions
) => Promise<Connection>;
const createConnection: createConnectionPostgres = createConnectionBase;

export default async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  const newOptions = {
    ...defaultOptions,
    database:
      process.env.NODE_ENV !== 'test'
        ? defaultOptions.database
        : 'testings_challenge_test',
  } as PostgresConnectionOptions;

  return createConnection(newOptions);
};
