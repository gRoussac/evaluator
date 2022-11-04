import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Message } from '@evaluator/shared-types';

export class SqliteService {

  private db!: Database<sqlite3.Database, sqlite3.Statement>;

  private async open() {
    this.db = await open({
      filename: 'database.db',
      driver: sqlite3.Database
    });
  }

  private async close() {
    await this.db.close();
  }

  async insert(message: Message) {
    console.log('insert', message.url);
    await this.open().catch(error => console.error(error));;
    const stmt = await this.db.prepare('INSERT INTO message  (url, function)VALUES (?, ?)');
    await stmt.run([message.url, message.fn], (error: any) => {
      console.error(error);
    });
    await stmt.finalize();
    await this.close().catch(error => console.error(error));
  }

}
