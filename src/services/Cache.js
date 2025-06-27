/**
 * Cache Service
 * This service provides a simple in-memory cache implementation
 * for storing and retrieving key-value pairs.
 */
export class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieve the value associated with a given key.
   * @param key {string} - The key to look up in the cache
   * @returns {any} - The value associated with the key
   * @throws {Error} If the key does not exist in the cache
   */
  get(key) {
    if (!this.cache.has(key)) {
      throw new Error("Key not found");
    }

    return this.cache.get(key);
  }

  /**
   * Create a new key with associated data.
   * @param data {any} - The data to associate with the new key
   * @returns {{key: string, data: any}} - An object containing the new key and its associated data
   */
  create(data) {
    // Make sure key is unique and string
    const key = Date.now().toString();

    if (this.cache.has(key)) {
      throw new Error("Key already in use");
    }

    this.cache.set(key, data);

    console.debug(`Created key: ${key}`);
    console.table(Array.from(this.cache.entries()));

    return { key, data };
  }

  /**
   * Update an existing key with new data.
   * @param key {string} - The key to update
   * @param data {any} - The new data to associate with the key
   */
  update(key, data) {
    if (!this.cache.has(key)) {
      throw new Error("Key not found");
    }

    console.debug(`Overriding ${key}`, data);
    this.cache.set(key, data);

    console.table(Array.from(this.cache.entries()));

    return { key, data };
  }

  /**
   * Remove a key and its associated data from the cache.
   * @param key {string} - The key to remove
   */
  remove(key) {
    if (!this.cache.delete(key)) {
      throw new Error("Key not found");
    }
  }

  /**
   * Retrieve all keys currently stored in the cache.
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**

  /**
   * Clear the entire cache.
   */
  clear() {
    this.cache.clear();
    console.debug("Cache cleared");
  }
}
