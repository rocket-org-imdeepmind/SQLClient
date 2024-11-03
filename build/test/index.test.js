"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const index_1 = require("../src/index");
// Create mock functions
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn();
const mockEnd = jest.fn();
// Mock pg Pool
jest.mock('pg', () => {
    return {
        Pool: jest.fn(() => ({
            connect: mockConnect,
            end: mockEnd,
        })),
    };
});
describe('SqlClient', () => {
    let sqlClient;
    let mockLogger;
    let mockClient;
    const defaultOptions = {
        user: 'testuser',
        host: 'localhost',
        database: 'testdb',
        password: 'testpass',
        port: 5432,
    };
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Setup mock client
        mockClient = {
            query: mockQuery,
            release: mockRelease,
        };
        // Setup mock logger
        mockLogger = {
            error: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
        };
        // Setup connect mock to return our mock client
        mockConnect.mockResolvedValue(mockClient);
        mockEnd.mockResolvedValue(undefined);
        // Create SqlClient instance
        sqlClient = new index_1.default(defaultOptions, mockLogger);
    });
    describe('Constructor', () => {
        it('should create instance with custom logger', () => {
            const client = new index_1.default(defaultOptions, mockLogger);
            expect(pg_1.Pool).toHaveBeenCalledWith({ ...defaultOptions, ssl: true });
        });
        it('should create instance with default console logger', async () => {
            const consoleSpy = jest.spyOn(console, 'info');
            const client = new index_1.default(defaultOptions);
            expect(pg_1.Pool).toHaveBeenCalledWith({ ...defaultOptions, ssl: true });
            await client.closePool(); // This should use console.info
            expect(consoleSpy).toHaveBeenCalled();
        });
    });
    describe('Query Validation', () => {
        it('should throw error for invalid DDL command', async () => {
            const invalidQuery = 'SELECT * FROM users';
            await expect(sqlClient.executeDDL(invalidQuery)).rejects.toThrow('Invalid SQL command');
        });
        it('should throw error for invalid DQL command', async () => {
            const invalidQuery = 'INSERT INTO users (name) VALUES ($1)';
            await expect(sqlClient.executeDQL(invalidQuery)).rejects.toThrow('Invalid SQL command');
        });
        it('should throw error for invalid DML command', async () => {
            const invalidQuery = 'SELECT * FROM users';
            await expect(sqlClient.executeDML(invalidQuery)).rejects.toThrow('Invalid SQL command');
        });
    });
    describe('executeDDL', () => {
        it('should execute valid DDL query successfully', async () => {
            const query = 'CREATE TABLE users (id SERIAL PRIMARY KEY)';
            mockQuery.mockResolvedValueOnce({ rows: [] });
            await sqlClient.executeDDL(query);
            expect(mockConnect).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith(query, []);
            expect(mockRelease).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith('DDL query executed successfully.');
        });
        it('should handle DDL query error', async () => {
            const query = 'CREATE TABLE users (id SERIAL PRIMARY KEY)';
            const error = new Error('Database error');
            mockQuery.mockRejectedValueOnce(error);
            await expect(sqlClient.executeDDL(query)).rejects.toThrow('Database error');
            expect(mockLogger.error).toHaveBeenCalledWith('Error executing DDL query:', error);
            expect(mockRelease).toHaveBeenCalled();
        });
    });
    describe('executeDQL', () => {
        it('should execute simple SELECT query successfully', async () => {
            const query = 'SELECT * FROM users';
            const mockRows = [{ id: 1, name: 'Test' }];
            mockQuery.mockResolvedValueOnce({ rows: mockRows });
            const result = await sqlClient.executeDQL(query);
            expect(mockConnect).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith(query, []);
            expect(result).toEqual(mockRows);
            expect(mockRelease).toHaveBeenCalled();
        });
        it('should handle pagination correctly', async () => {
            const query = 'SELECT * FROM users';
            const limit = 5;
            const page = 2;
            const params = ['active'];
            mockQuery.mockResolvedValueOnce({ rows: [] });
            await sqlClient.executeDQL(query, params, true, limit, page);
            expect(mockQuery).toHaveBeenCalledWith(`${query} LIMIT $2 OFFSET $3`, [
                'active',
                5,
                5,
            ]);
        });
        it('should handle DQL query error', async () => {
            const query = 'SELECT * FROM users';
            const error = new Error('Database error');
            mockQuery.mockRejectedValueOnce(error);
            await expect(sqlClient.executeDQL(query)).rejects.toThrow('Database error');
            expect(mockLogger.error).toHaveBeenCalledWith('Error executing DQL query:', error);
            expect(mockRelease).toHaveBeenCalled();
        });
    });
    describe('executeDML', () => {
        it('should execute INSERT query successfully', async () => {
            const query = 'INSERT INTO users (name) VALUES ($1)';
            const params = ['Test User'];
            mockQuery.mockResolvedValueOnce({ rowCount: 1 });
            const result = await sqlClient.executeDML(query, params);
            expect(mockConnect).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalledWith(query, params);
            expect(result).toBe(1);
            expect(mockRelease).toHaveBeenCalled();
        });
        it('should handle null rowCount', async () => {
            const query = 'UPDATE users SET name = $1';
            mockQuery.mockResolvedValueOnce({ rowCount: null });
            const result = await sqlClient.executeDML(query);
            expect(result).toBe(0);
        });
        it('should handle DML query error', async () => {
            const query = 'DELETE FROM users';
            const error = new Error('Database error');
            mockQuery.mockRejectedValueOnce(error);
            await expect(sqlClient.executeDML(query)).rejects.toThrow('Database error');
            expect(mockLogger.error).toHaveBeenCalledWith('Error executing DML query:', error);
            expect(mockRelease).toHaveBeenCalled();
        });
    });
    describe('closePool', () => {
        it('should close pool successfully', async () => {
            await sqlClient.closePool();
            expect(mockEnd).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith('Connection pool closed.');
        });
    });
});
//# sourceMappingURL=index.test.js.map