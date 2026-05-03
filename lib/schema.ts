import { pgTable, serial, text, real, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Variedades de lúpulo
export const variedades = pgTable('variedades', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  activa: boolean('activa').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Lotes — creados por el ESP32 via POST /api/lotes
export const lotes = pgTable('lotes', {
  id: serial('id').primaryKey(),
  numeroLote: text('numero_lote').notNull().unique(),
  variedadId: integer('variedad_id').references(() => variedades.id).notNull(),
  humedad: real('humedad').notNull(),
  temperatura: real('temperatura'),
  pesoGramos: integer('peso_gramos'),
  cosecha: integer('cosecha'),
  sensorId: text('sensor_id'),
  fotoUrl: text('foto_url'),
  labPdfUrl: text('lab_pdf_url'),
  qrUrl: text('qr_url'),
  publicado: boolean('publicado').default(false).notNull(),
  fechaEnvasado: timestamp('fecha_envasado').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Lecturas del sensor — historial completo del ESP32
export const lecturasSensor = pgTable('lecturas_sensor', {
  id: serial('id').primaryKey(),
  loteId: integer('lote_id').references(() => lotes.id),
  sensorId: text('sensor_id').notNull(),
  humedad: real('humedad').notNull(),
  temperatura: real('temperatura'),
  variedadId: integer('variedad_id').references(() => variedades.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

// ==============================================
// TABLAS PARA AUTH.JS (CORREGIDAS)
// ==============================================

// Usuarios admin
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
})

// Accounts - CORREGIDA (sin id, con primary key compuesta)
export const accounts = pgTable('accounts', {
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] })
}))

// Sessions - CORREGIDA (sessionToken como primary key)
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expires: timestamp('expires').notNull(),
})

// Verification Tokens - CORREGIDA
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] })
}))

// ==============================================
// RELACIONES
// ==============================================

export const variedadesRelations = relations(variedades, ({ many }) => ({
  lotes: many(lotes),
}))

export const lotesRelations = relations(lotes, ({ one }) => ({
  variedad: one(variedades, {
    fields: [lotes.variedadId],
    references: [variedades.id],
  }),
}))

export const lecturasSensorRelations = relations(lecturasSensor, ({ one }) => ({
  lote: one(lotes, {
    fields: [lecturasSensor.loteId],
    references: [lotes.id],
  }),
  variedad: one(variedades, {
    fields: [lecturasSensor.variedadId],
    references: [variedades.id],
  }),
}))

// Relaciones de Auth (opcionales, pero útiles)
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))