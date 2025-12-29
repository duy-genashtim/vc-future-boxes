/**
 * Database Service for FutureBoxes
 * Handles SQLite database operations for capsules, images, and settings
 *
 * @module services/database
 * @requires expo-sqlite
 */

import * as SQLite from 'expo-sqlite';
import { Capsule, CapsuleImage, CapsuleStatus } from '../types';
import { DB_NAME } from '../constants';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize database connection and create tables
 * Should be called once during app startup
 *
 * @throws {Error} If database initialization fails
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Open database connection
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Check if migration is needed (title column missing)
    await migrateIfNeeded();

    // Create tables if not exist
    await createTables();

    // Create indexes for query optimization
    await createIndexes();

    // Set schema version
    await setSetting('schemaVersion', '1');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
}

/**
 * Migrate database schema if needed
 * Checks if title column exists, if not, drops and recreates all tables
 * @private
 */
async function migrateIfNeeded(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Check if capsule table exists
    const tableExists = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='capsule'"
    );

    if (tableExists && tableExists.count > 0) {
      // Check if title column exists
      const columnInfo = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(capsule)"
      );

      const hasTitleColumn = columnInfo.some(col => col.name === 'title');

      if (!hasTitleColumn) {
        console.log('Migration needed: title column missing. Dropping old tables...');

        // Drop all tables to recreate with new schema
        await db.execAsync('DROP TABLE IF EXISTS capsule_image;');
        await db.execAsync('DROP TABLE IF EXISTS capsule;');
        await db.execAsync('DROP TABLE IF EXISTS app_settings;');

        console.log('Old tables dropped. New tables will be created.');
      }
    }
  } catch (error) {
    console.error('Migration check failed:', error);
    // Continue anyway - createTables will handle table creation
  }
}

/**
 * Create database tables
 * @private
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Create capsule table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS capsule (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('emotion', 'goal', 'memory', 'decision')),
        title TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        unlock_at INTEGER NOT NULL,
        opened_at INTEGER,
        status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'ready', 'opened')),
        reflection_question TEXT,
        reflection_type TEXT NOT NULL CHECK (reflection_type IN ('yes_no', 'rating', 'none')),
        reflection_answer TEXT
      );
    `);

    // Create capsule_image table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS capsule_image (
        id TEXT PRIMARY KEY,
        capsule_id TEXT NOT NULL,
        uri TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (capsule_id) REFERENCES capsule(id) ON DELETE CASCADE
      );
    `);

    // Create app_settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
}

/**
 * Create database indexes for query optimization
 * @private
 */
async function createIndexes(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Index for status-based queries (Home Screen)
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_capsule_status
      ON capsule(status);
    `);

    // Index for unlock time queries (Timer checks)
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_capsule_unlock_at
      ON capsule(unlock_at);
    `);

    // Index for opened capsules (Archive)
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_capsule_opened_at
      ON capsule(opened_at);
    `);

    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Failed to create indexes:', error);
    throw error;
  }
}

/**
 * Generate UUID v4
 * @private
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Convert database row to Capsule object
 * @private
 */
function rowToCapsule(row: any): Capsule {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    unlockAt: row.unlock_at,
    openedAt: row.opened_at,
    status: row.status,
    reflectionQuestion: row.reflection_question,
    reflectionType: row.reflection_type,
    reflectionAnswer: row.reflection_answer,
  };
}

/**
 * Convert database row to CapsuleImage object
 * @private
 */
function rowToCapsuleImage(row: any): CapsuleImage {
  return {
    id: row.id,
    capsuleId: row.capsule_id,
    uri: row.uri,
    order: row.order_index,
  };
}

// ============================================================================
// CAPSULE OPERATIONS
// ============================================================================

/**
 * Create a new capsule
 *
 * @param capsule - Capsule data without id
 * @returns The generated capsule ID
 * @throws {Error} If creation fails
 */
export async function createCapsule(
  capsule: Omit<Capsule, 'id'>
): Promise<string> {
  if (!db) throw new Error('Database not initialized');

  try {
    const capsuleId = generateUUID();
    const now = Math.floor(Date.now() / 1000);

    // Validate unlock time is in the future
    if (capsule.unlockAt <= now) {
      throw new Error('Unlock time must be in the future');
    }

    // Validate content length
    if (capsule.content.length === 0 || capsule.content.length > 2000) {
      throw new Error('Content must be between 1 and 2000 characters');
    }

    await db.runAsync(
      `INSERT INTO capsule (
        id, type, title, content, created_at, unlock_at, opened_at,
        status, reflection_question, reflection_type, reflection_answer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        capsuleId,
        capsule.type,
        capsule.title || null,
        capsule.content,
        capsule.createdAt,
        capsule.unlockAt,
        capsule.openedAt || null,
        capsule.status,
        capsule.reflectionQuestion || null,
        capsule.reflectionType,
        capsule.reflectionAnswer || null,
      ]
    );

    console.log(`Capsule created with ID: ${capsuleId}`);
    return capsuleId;
  } catch (error) {
    console.error('Failed to create capsule:', error);
    throw error;
  }
}

/**
 * Get a single capsule by ID
 *
 * @param id - Capsule ID
 * @returns Capsule object or null if not found
 */
export async function getCapsule(id: string): Promise<Capsule | null> {
  if (!db) throw new Error('Database not initialized');

  try {
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM capsule WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return rowToCapsule(row);
  } catch (error) {
    console.error('Failed to get capsule:', error);
    throw error;
  }
}

/**
 * Get all capsules
 *
 * @returns Array of all capsules
 */
export async function getAllCapsules(): Promise<Capsule[]> {
  if (!db) throw new Error('Database not initialized');

  try {
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM capsule ORDER BY created_at DESC'
    );

    return rows.map(rowToCapsule);
  } catch (error) {
    console.error('Failed to get all capsules:', error);
    throw error;
  }
}

/**
 * Get capsules by status
 *
 * @param status - Capsule status filter
 * @param limit - Maximum number of results
 * @returns Array of capsules matching the status
 */
export async function getCapsulesByStatus(
  status: CapsuleStatus[],
  limit?: number
): Promise<Capsule[]> {
  if (!db) throw new Error('Database not initialized');

  try {
    const placeholders = status.map(() => '?').join(',');
    const query = `
      SELECT * FROM capsule
      WHERE status IN (${placeholders})
      ORDER BY unlock_at ASC
      ${limit ? `LIMIT ${limit}` : ''}
    `;

    const rows = await db.getAllAsync<any>(query, status);

    return rows.map(rowToCapsule);
  } catch (error) {
    console.error('Failed to get capsules by status:', error);
    throw error;
  }
}

/**
 * Get opened capsules for Archive screen
 *
 * @returns Array of opened capsules sorted by opened_at DESC
 */
export async function getOpenedCapsules(): Promise<Capsule[]> {
  if (!db) throw new Error('Database not initialized');

  try {
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM capsule
       WHERE status = 'opened'
       ORDER BY opened_at DESC`
    );

    return rows.map(rowToCapsule);
  } catch (error) {
    console.error('Failed to get opened capsules:', error);
    throw error;
  }
}

/**
 * Update capsule status
 *
 * @param id - Capsule ID
 * @param status - New status
 */
export async function updateCapsuleStatus(
  id: string,
  status: CapsuleStatus
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    const updates: any = { status };

    // Set opened_at timestamp if status is 'opened'
    if (status === 'opened') {
      updates.opened_at = Math.floor(Date.now() / 1000);
    }

    await db.runAsync(
      `UPDATE capsule
       SET status = ?, opened_at = ?
       WHERE id = ?`,
      [status, updates.opened_at || null, id]
    );

    console.log(`Capsule ${id} status updated to ${status}`);
  } catch (error) {
    console.error('Failed to update capsule status:', error);
    throw error;
  }
}

/**
 * Update capsule reflection answer
 *
 * @param id - Capsule ID
 * @param answer - Reflection answer (yes/no or 1-5)
 */
export async function updateCapsuleReflection(
  id: string,
  answer: string | number
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync(
      'UPDATE capsule SET reflection_answer = ? WHERE id = ?',
      [String(answer), id]
    );

    console.log(`Capsule ${id} reflection answer updated`);
  } catch (error) {
    console.error('Failed to update capsule reflection:', error);
    throw error;
  }
}

/**
 * Check and update status for locked capsules that reached unlock time
 * Should be called periodically (e.g., every minute)
 *
 * @returns Number of capsules updated
 */
export async function checkAndUpdateReadyCapsules(): Promise<number> {
  if (!db) throw new Error('Database not initialized');

  try {
    const now = Math.floor(Date.now() / 1000);

    const result = await db.runAsync(
      `UPDATE capsule
       SET status = 'ready'
       WHERE status = 'locked' AND unlock_at <= ?`,
      [now]
    );

    const updatedCount = result.changes;

    if (updatedCount > 0) {
      console.log(`${updatedCount} capsule(s) updated to ready status`);
    }

    return updatedCount;
  } catch (error) {
    console.error('Failed to check and update ready capsules:', error);
    throw error;
  }
}

/**
 * Delete a capsule (only allowed for opened capsules)
 *
 * @param id - Capsule ID
 * @throws {Error} If capsule is not opened or deletion fails
 */
export async function deleteCapsule(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Check if capsule is opened
    const capsule = await getCapsule(id);

    if (!capsule) {
      throw new Error('Capsule not found');
    }

    if (capsule.status !== 'opened') {
      throw new Error('Can only delete opened capsules');
    }

    // Delete capsule (images will be cascade deleted)
    await db.runAsync('DELETE FROM capsule WHERE id = ?', [id]);

    console.log(`Capsule ${id} deleted`);
  } catch (error) {
    console.error('Failed to delete capsule:', error);
    throw error;
  }
}

// ============================================================================
// CAPSULE IMAGE OPERATIONS
// ============================================================================

/**
 * Add an image to a capsule
 *
 * @param image - Image data without id
 */
export async function addCapsuleImage(
  image: Omit<CapsuleImage, 'id'>
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    const imageId = generateUUID();

    await db.runAsync(
      `INSERT INTO capsule_image (id, capsule_id, uri, order_index)
       VALUES (?, ?, ?, ?)`,
      [imageId, image.capsuleId, image.uri, image.order]
    );

    console.log(`Image added to capsule ${image.capsuleId}`);
  } catch (error) {
    console.error('Failed to add capsule image:', error);
    throw error;
  }
}

/**
 * Get all images for a capsule
 *
 * @param capsuleId - Capsule ID
 * @returns Array of images sorted by order
 */
export async function getCapsuleImages(
  capsuleId: string
): Promise<CapsuleImage[]> {
  if (!db) throw new Error('Database not initialized');

  try {
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM capsule_image
       WHERE capsule_id = ?
       ORDER BY order_index ASC`,
      [capsuleId]
    );

    return rows.map(rowToCapsuleImage);
  } catch (error) {
    console.error('Failed to get capsule images:', error);
    throw error;
  }
}

/**
 * Delete all images for a capsule
 *
 * @param capsuleId - Capsule ID
 */
export async function deleteCapsuleImages(capsuleId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.runAsync(
      'DELETE FROM capsule_image WHERE capsule_id = ?',
      [capsuleId]
    );

    console.log(`Images deleted for capsule ${capsuleId}`);
  } catch (error) {
    console.error('Failed to delete capsule images:', error);
    throw error;
  }
}

// ============================================================================
// APP SETTINGS OPERATIONS
// ============================================================================

/**
 * Get a setting value
 *
 * @param key - Setting key
 * @returns Setting value or null if not found
 */
export async function getSetting(key: string): Promise<any> {
  if (!db) throw new Error('Database not initialized');

  try {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      [key]
    );

    if (!row) return null;

    // Try to parse as JSON
    try {
      return JSON.parse(row.value);
    } catch {
      return row.value;
    }
  } catch (error) {
    console.error('Failed to get setting:', error);
    throw error;
  }
}

/**
 * Set a setting value
 *
 * @param key - Setting key
 * @param value - Setting value (will be JSON stringified)
 */
export async function setSetting(key: string, value: any): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value)
       VALUES (?, ?)`,
      [key, stringValue]
    );

    console.log(`Setting ${key} updated`);
  } catch (error) {
    console.error('Failed to set setting:', error);
    throw error;
  }
}

/**
 * Get all settings
 *
 * @returns Object with all settings
 */
export async function getAllSettings(): Promise<Record<string, any>> {
  if (!db) throw new Error('Database not initialized');

  try {
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM app_settings'
    );

    const settings: Record<string, any> = {};

    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return settings;
  } catch (error) {
    console.error('Failed to get all settings:', error);
    throw error;
  }
}

// ============================================================================
// APP SETTINGS - STRUCTURED (for AppSettings interface)
// ============================================================================

/**
 * Get app settings as structured AppSettings object
 *
 * @returns AppSettings object with default values if not found
 */
export async function getAppSettings(): Promise<import('../types').AppSettings> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Get individual settings with defaults
    const onboardingCompleted = await getSetting('onboardingCompleted');
    const notificationsEnabled = await getSetting('notificationsEnabled');
    const lastNotificationCheck = await getSetting('lastNotificationCheck');

    return {
      onboardingCompleted: onboardingCompleted === true || onboardingCompleted === 'true',
      notificationsEnabled: notificationsEnabled === true || notificationsEnabled === 'true',
      lastNotificationCheck: lastNotificationCheck || undefined,
    };
  } catch (error) {
    console.error('Failed to get app settings:', error);

    // Return default settings on error (graceful degradation)
    return {
      onboardingCompleted: false,
      notificationsEnabled: false,
      lastNotificationCheck: undefined,
    };
  }
}

/**
 * Update app settings (partial update supported)
 *
 * @param settings - Partial AppSettings object to update
 */
export async function updateAppSettings(
  settings: Partial<import('../types').AppSettings>
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Update only provided fields
    if (settings.onboardingCompleted !== undefined) {
      await setSetting('onboardingCompleted', settings.onboardingCompleted);
    }

    if (settings.notificationsEnabled !== undefined) {
      await setSetting('notificationsEnabled', settings.notificationsEnabled);
    }

    if (settings.lastNotificationCheck !== undefined) {
      await setSetting('lastNotificationCheck', settings.lastNotificationCheck);
    }

    console.log('App settings updated successfully');
  } catch (error) {
    console.error('Failed to update app settings:', error);
    throw error;
  }
}

/**
 * Close database connection
 * Should be called when app is closing
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
      db = null;
      console.log('Database closed successfully');
    } catch (error) {
      console.error('Failed to close database:', error);
    }
  }
}
