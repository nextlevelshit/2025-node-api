/**
 * Cache Service
 * This service provides a simple in-memory cache implementation
 * for storing and retrieving key-value pairs.
 */
export class Cache {
  /**
   * Constructor for the Cache service.
   * @param options {{override?: boolean, debug?: boolean}} - Configuration options for the cache
   */
  constructor(options = { override: false, debug: false }) {
    this.options = options;
    this.cache = new Map();
  }

  /**
   * Retrieve the value associated with a given key.
   * @param key {string} - The key to look up in the cache
   * @returns {unknown} - The value associated with the key
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
   * @param data {unknown} - The data to associate with the new key
   * @param key {string} - Optional custom key; if not provided, a timestamp will be used
   * @returns {string} - A unique identifier for the created cache entry
   */
  create(data, key = Date.now().toString()) {
    this.log(`Creating key: ${key}`, data);

    if (this.cache.has(key)) {
      if (this.options.override) {
        this.log(`Key ${key} already exists, overriding.`);
        const existingData = this.cache.get(key);
        this.cache.set(key, {
          ...existingData,
          ...data,
        });
      } else {
        this.log("Overriding is disabled in options.");
        this.log(`Key ${key} already exists, not overriding.`);
        throw new Error("Key already in use");
      }
    } else {
      this.cache.set(key, data);
    }

    this.logTable(Array.from(this.values));

    return key;
  }

  /**
   * Update an existing key with new data.
   * @param key {string} - The key to update
   * @param data {unknown} - The new data to associate with the key
   * @returns {{key: string, data: unknown}} - An object containing the key and updated data
   */
  update(key, data) {
    if (!this.cache.has(key)) {
      throw new Error("Key not found");
    }

    const existingData = this.cache.get(key);
    const newData = { ...existingData, ...data };

    this.cache.set(key, newData);

    this.log(`Overriding ${key}`, data);
    this.logTable(Array.from(this.cache.entries()));

    return { key, data: newData };
  }

  /**
   * Remove a key and its associated data from the cache.
   * @param key {string} - The key to remove
   * @throws {Error} If the key does not exist in the cache
   */
  remove(key) {
    if (!this.cache.delete(key)) {
      throw new Error("Key not found");
    }
  }

  /**
   * Retrieve all keys currently stored in the cache.
   * @returns {string[]} - An array of all keys in the cache
   */
  get keys() {
    return Array.from(this.cache.keys()); // Eqivalent to [...this.cache.keys()]
  }

  /**
   * Retrieve all values currently stored in the cache.
   * @returns {unknown[]} - An array of all values in the cache
   */
  get values() {
    return Array.from(this.cache.values()); // Equivalent to [...this.cache.values()]
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this.cache.clear();
    this.log("Cache cleared");
  }

  /**
   * Log a message to the console if debugging is enabled.
   * @param message
   */
  log(message) {
    if (this.options.debug) {
      console.log(message);
    }
  }

  /**
   * Log a message as a table.
   * @param message
   */
  logTable(message) {
    if (this.options.debug) {
      console.table(message);
    }
  }
}
