"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class SqlClient {
    pool;
    logger;
    constructor(options, logger) {
        this.pool = new pg_1.Pool({ ...options, ssl: true });
        this.logger = logger || console; // Use provided logger, or default to console
    }
    /**
     * Validates if the query starts with any of the allowed keywords.
     * @param query - The SQL query string to validate.
     * @param allowedCommands - Array of allowed SQL commands for the method.
     */
    validateQuery(query, allowedCommands) {
        const command = query.trim().split(' ')[0].toUpperCase();
        if (!allowedCommands.includes(command)) {
            throw new Error(`Invalid SQL command: ${command}. Allowed commands are: ${allowedCommands.join(', ')}`);
        }
    }
    /**
     * DDL - Executes a Data Definition Language statement
     * @param query - The SQL query string for DDL operations
     * @param params - Optional parameters for parameterized queries
     */
    async executeDDL(query, params = []) {
        this.validateQuery(query, ['CREATE', 'ALTER', 'DROP', 'TRUNCATE']);
        const client = await this.pool.connect();
        try {
            await client.query(query, params);
            this.logger.info('DDL query executed successfully.');
        }
        catch (error) {
            this.logger.error('Error executing DDL query:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * DQL - Executes a Data Query Language statement with optional pagination
     * @param query - The SQL query string for DQL operations
     * @param params - Optional parameters for parameterized queries
     * @param many - If true, applies pagination using limit and page
     * @param limit - Maximum number of rows per page (default: 10)
     * @param page - Page number for pagination (default: 1)
     * @returns - Array of rows as query results
     */
    async executeDQL(query, params = [], many = false, limit = 10, page = 1) {
        this.validateQuery(query, ['SELECT']);
        const client = await this.pool.connect();
        try {
            if (many) {
                const offset = (page - 1) * limit;
                query = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
                params.push(limit, offset);
            }
            const result = await client.query(query, params);
            this.logger.info('DQL query executed successfully.');
            return result.rows;
        }
        catch (error) {
            this.logger.error('Error executing DQL query:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * DML - Executes a Data Manipulation Language statement
     * @param query - The SQL query string for DML operations
     * @param params - Optional parameters for parameterized queries
     * @returns - Number of rows affected
     */
    async executeDML(query, params = []) {
        this.validateQuery(query, ['INSERT', 'UPDATE', 'DELETE']);
        const client = await this.pool.connect();
        try {
            const result = await client.query(query, params);
            this.logger.info('DML query executed successfully.');
            return result.rowCount ?? 0;
        }
        catch (error) {
            this.logger.error('Error executing DML query:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Closes the connection pool gracefully
     */
    async closePool() {
        await this.pool.end();
        this.logger.info('Connection pool closed.');
    }
}
exports.default = SqlClient;
//# sourceMappingURL=index.js.map