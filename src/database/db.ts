import * as SQLite from 'expo-sqlite';

const DB_NAME = 'conexioncorp.db';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ Error al abrir la base de datos:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    try {
      await db.closeAsync();
      db = null;
      console.log('❌ Base de datos cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar la base de datos:', error);
      throw error;
    }
  }
};

export const executeQuery = async (
  query: string,
  params: any[] = [],
): Promise<any[]> => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error en consulta:', error);
    throw error;
  }
};

export const executeSingleQuery = async (
  query: string,
  params: any[] = [],
): Promise<any | null> => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error en consulta:', error);
    throw error;
  }
};

export const executeAction = async (
  query: string,
  params: any[] = [],
): Promise<SQLite.SQLiteRunResult> => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(query, params);
    return result;
  } catch (error) {
    console.error('❌ Error en accion (INSERT/UPDATE/DELETE):', error);
    throw error;
  }
};
