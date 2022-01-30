import createConnection from '@/database';

import { app } from './app';

(async () => {
  await createConnection();

  app.listen(3333, () => console.log('Server is running!'));
})();
