interface TSqlClientOptions {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}
interface TLogger {
    error: (msg: string, ...args: unknown[]) => void;
    debug: (msg: string, ...args: unknown[]) => void;
    info: (msg: string, ...args: unknown[]) => void;
}
declare class SqlClient {
    private pool;
    private logger;
    constructor(options: TSqlClientOptions, logger?: TLogger);
    /**
     * Validates if the query starts with any of the allowed keywords.
     * @param query - The SQL query string to validate.
     * @param allowedCommands - Array of allowed SQL commands for the method.
     */
    private validateQuery;
    /**
     * DDL - Executes a Data Definition Language statement
     * @param query - The SQL query string for DDL operations
     * @param params - Optional parameters for parameterized queries
     */
    executeDDL(query: string, params?: unknown[]): Promise<void>;
    /**
     * DQL - Executes a Data Query Language statement with optional pagination
     * @param query - The SQL query string for DQL operations
     * @param params - Optional parameters for parameterized queries
     * @param many - If true, applies pagination using limit and page
     * @param limit - Maximum number of rows per page (default: 10)
     * @param page - Page number for pagination (default: 1)
     * @returns - Array of rows as query results
     */
    executeDQL<T>(query: string, params?: unknown[], many?: boolean, limit?: number, page?: number): Promise<T[] | T>;
    /**
     * DML - Executes a Data Manipulation Language statement
     * @param query - The SQL query string for DML operations
     * @param params - Optional parameters for parameterized queries
     * @returns - Number of rows affected
     */
    executeDML(query: string, params?: unknown[]): Promise<number>;
    /**
     * Closes the connection pool gracefully
     */
    closePool(): Promise<void>;
}

export { type TLogger, type TSqlClientOptions, SqlClient as default };
