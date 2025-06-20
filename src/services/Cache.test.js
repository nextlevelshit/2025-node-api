import { Cache } from './Cache';

describe('Cache', () => {
    let cache;

    beforeEach(() => {
        cache = new Cache();
        // Mock console methods to prevent test output noise
        console.table = jest.fn();
        console.debug = jest.fn();
    });

    describe('create method', () => {
        test('should create a new cache entry and return the key', () => {
            // Mock Date.now to return a consistent value for testing
            const mockTimestamp = 123456789;
            jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);

            const testData = { name: 'test data' };
            cache.create(testData);

            // Verify data was properly stored
            expect(cache.cache.has(mockTimestamp)).toBe(true);
            expect(cache.cache.get(mockTimestamp)).toEqual(testData);
            expect(console.table).toHaveBeenCalled();
        });

        test('should throw an error if key already exists', () => {
            // Force a key collision scenario
            const mockTimestamp = 123456789;
            jest.spyOn(Date, 'now').mockImplementation(() => mockTimestamp);

            cache.create({ name: 'first data' });

            // Attempt to create another entry with the same timestamp
            expect(() => {
                cache.create({ name: 'second data' });
            }).toThrow('Key already in use');
        });
    });

    describe('get method', () => {
        test('should retrieve data for a valid key', () => {
            const mockTimestamp = 123456789;
            const testData = { name: 'test data' };

            // Manually set up the cache
            cache.cache.set(mockTimestamp, testData);

            const result = cache.get(mockTimestamp);
            expect(result).toEqual(testData);
        });

        test('should throw an error for a non-existent key', () => {
            expect(() => {
                cache.get('nonexistent-key');
            }).toThrow('Key not found');
        });
    });

    describe('update method', () => {
        test('should update data for an existing key', () => {
            const mockTimestamp = 123456789;
            const initialData = { name: 'initial data' };
            const updatedData = { name: 'updated data' };

            // Set up initial data
            cache.cache.set(mockTimestamp, initialData);

            // Update the data
            cache.update(mockTimestamp, updatedData);

            // Verify the update happened
            expect(cache.cache.get(mockTimestamp)).toEqual(updatedData);
            expect(console.debug).toHaveBeenCalledWith(`Overriding ${mockTimestamp}`, updatedData);
        });

        test('should throw an error when updating a non-existent key', () => {
            expect(() => {
                cache.update('nonexistent-key', { name: 'new data' });
            }).toThrow('Key not found');
        });
    });

    describe('remove method', () => {
        test('should remove an existing key-value pair', () => {
            const mockTimestamp = 123456789;
            const testData = { name: 'test data' };

            // Set up data to be removed
            cache.cache.set(mockTimestamp, testData);

            // Remove the data
            cache.remove(mockTimestamp);

            // Verify removal
            expect(cache.cache.has(mockTimestamp)).toBe(false);
        });

        test('should throw an error when removing a non-existent key', () => {
            expect(() => {
                cache.remove('nonexistent-key');
            }).toThrow('Key not found');
        });
    });

    describe('keys method', () => {
        test('should be implemented', () => {
            // This is a placeholder test for the empty keys method
            // You might want to implement this method in your Cache class
            expect(cache.keys).toBeDefined();
        });
    });
});