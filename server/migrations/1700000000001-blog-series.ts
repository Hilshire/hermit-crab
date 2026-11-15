/* eslint-disable class-methods-use-this, no-restricted-syntax, no-await-in-loop */
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class BlogSeries1700000000001 implements MigrationInterface {
  name = 'BlogSeries1700000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      new TableColumn({ name: 'parentId', type: 'int', isNullable: true }),
      new TableColumn({ name: 'commentTerm', type: 'text', isNullable: true }),
      new TableColumn({ name: 'commentIssueNumber', type: 'int', isNullable: true }),
      new TableColumn({ name: 'deletedAt', type: 'datetime', isNullable: true }),
      new TableColumn({ name: 'deletedWithId', type: 'int', isNullable: true }),
    ];
    for (const column of columns) {
      if (!(await queryRunner.hasColumn('blog', column.name))) await queryRunner.addColumn('blog', column);
    }
    const legacyTerm = queryRunner.connection.options.type === 'mysql'
      ? "CONCAT(title, ' - hilshire''s blog')" : "title || ' - hilshire''s blog'";
    await queryRunner.query(`UPDATE blog SET commentTerm = ${legacyTerm} WHERE commentTerm IS NULL`);
  }

  async down(): Promise<void> {
    throw new Error('This migration cannot be safely reverted automatically because columns may predate it.');
  }
}
