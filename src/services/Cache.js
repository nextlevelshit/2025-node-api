export class Cache {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            throw new Error("Key not found");
        }

        return this.cache.get(key);
    }

    create(data) {
        const key = Date.now();

        if (this.cache.has(key)) {
            throw new Error("Key already in use");
        }

        this.cache.set(key, data);

        console.table(this.cache.entries());
    }

    update(key, data) {
        if (!this.cache.has(key)) {
            throw new Error("Key not found");
        }

        console.debug(`Overriding ${key}`, data);

        this.cache.set(key, data);
    }

    remove(key) {
        if (!this.cache.has(key)) {
            throw new Error("Key not found");
        }

        this.cache.delete(key);
    }

    keys() {}
}