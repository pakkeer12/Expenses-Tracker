declare module 'better-sqlite3-session-store' {
  import { Store } from 'express-session';
  import Database from 'better-sqlite3';

  interface SessionStoreOptions {
    client: Database.Database;
    expired?: {
      clear?: boolean;
      intervalMs?: number;
    };
  }

  function SqliteStore(session: any): {
    new (options: SessionStoreOptions): Store;
  };

  export = SqliteStore;
}
