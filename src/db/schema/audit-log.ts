import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entity_id'),
  beforeState: text('before_state'),
  afterState: text('after_state'),
  requestId: text('request_id').notNull(),
  timestamp: text('timestamp').notNull().$defaultFn(() => new Date().toISOString()),
});
