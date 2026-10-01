/* eslint-disable class-methods-use-this */
import {
  MigrationInterface, QueryRunner, Table,
} from 'typeorm';

export class InitialSqliteSchema1700000000000 implements MigrationInterface {
  name = 'InitialSqliteSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'blog',
      columns: [
        {
          name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment',
        },
        { name: 'title', type: 'varchar', length: '100' },
        { name: 'context', type: 'text' },
        { name: 'blogType', type: 'integer', default: '1' },
        { name: 'createAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        { name: 'lastUpdateAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'tag',
      columns: [
        {
          name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment',
        },
        { name: 'name', type: 'varchar', length: '20' },
        { name: 'color', type: 'varchar', length: '7' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'comment',
      columns: [
        {
          name: 'id', type: 'integer', isPrimary: true, isGenerated: true, generationStrategy: 'increment',
        },
        { name: 'name', type: 'varchar', length: '30' },
        { name: 'context', type: 'text' },
        { name: 'blogId', type: 'integer', isNullable: true },
      ],
      foreignKeys: [{
        columnNames: ['blogId'], referencedTableName: 'blog', referencedColumnNames: ['id'],
      }],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'blog_tags_tag',
      columns: [
        { name: 'blogId', type: 'integer', isPrimary: true },
        { name: 'tagId', type: 'integer', isPrimary: true },
      ],
      foreignKeys: [
        {
          columnNames: ['blogId'], referencedTableName: 'blog', referencedColumnNames: ['id'], onDelete: 'CASCADE',
        },
        {
          columnNames: ['tagId'], referencedTableName: 'tag', referencedColumnNames: ['id'], onDelete: 'CASCADE',
        },
      ],
    }), true);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('blog_tags_tag', true);
    await queryRunner.dropTable('comment', true);
    await queryRunner.dropTable('tag', true);
    await queryRunner.dropTable('blog', true);
  }
}
