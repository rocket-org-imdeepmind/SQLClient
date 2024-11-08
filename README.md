  SqlClient README

# SqlClient

`SqlClient` is a TypeScript-based SQL client for PostgreSQL that leverages `node-postgres` for database interactions. It includes separate methods for Data Definition Language (DDL), Data Query Language (DQL), and Data Manipulation Language (DML) operations, with built-in support for connection pooling, logging, and pagination.

## Table of Contents

*   [Features](#features)
*   [Installation](#installation)
*   [Usage](#usage)
*   [Method Details](#method-details)
*   [Testing](#testing)
*   [License](#license)

## Features

*   **Connection Pooling:** Uses `pg.Pool` for efficient connection handling.
*   **Segregated Query Types:** Execute queries based on SQL command type: DDL, DQL, and DML.
*   **Query Validation:** Allows only specific commands for each query type.
*   **Pagination:** Supports pagination for DQL queries.
*   **Custom Logging:** Integrates optional logging support with customizable logger methods (`error`, `debug`, `info`).

## Installation

To install `SqlClient`, ensure you have [Node.js](https://nodejs.org/) installed and run:

```
npm install pg
```

## Usage

### Creating an Instance

To create an instance of `SqlClient`, pass in PostgreSQL connection configuration and, optionally, a custom logger with `log.error`, `log.debug`, and `log.info` methods.

```javascript
import SqlClient from './SqlClient';

const sqlClient = new SqlClient({
  user: 'yourUsername',
  host: 'localhost',
  database: 'yourDatabase',
  password: 'yourPassword',
  port: 5432,
}, customLogger);
```

### Executing Queries

Each method (`executeDDL`, `executeDQL`, and `executeDML`) executes specific query types, ensuring only allowed SQL commands are used.

#### DDL (Data Definition Language)

```javascript
await sqlClient.executeDDL('CREATE TABLE test_table (id SERIAL PRIMARY KEY)');
```

#### DQL (Data Query Language) with Pagination

```javascript
const result = await sqlClient.executeDQL('SELECT * FROM test_table', [], true, 10, 1);
console.log(result); // Logs rows of the first page with limit 10
```

#### DML (Data Manipulation Language)

```javascript
const rowsAffected = await sqlClient.executeDML('INSERT INTO test_table (name) VALUES ($1)', ['testName']);
console.log(rowsAffected); // Logs the number of rows affected
```

## Method Details

| Method | Allowed Commands | Description |
| --- | --- | --- |
| `executeDDL` | CREATE, ALTER, DROP, TRUNCATE | Executes schema-modifying commands (DDL). |
| `executeDQL` | SELECT | Executes data retrieval commands (DQL). Supports pagination. |
| `executeDML` | INSERT, UPDATE, DELETE | Executes data manipulation commands (DML). |

### Logger Fallback

If no logger is provided, `console.log` and `console.error` are used for logging.

## Testing

To test `SqlClient`, the project uses [Jest](https://jestjs.io/). Tests are designed to ensure each query type only accepts valid commands, uses a connection pool, and logs outputs.

### Setting Up Tests

Install Jest and TypeScript types:

```
npm install --save-dev jest @types/jest
```

In the `SqlClient.test.ts` file, mock the `pg.Pool` and `pg.PoolClient` objects to avoid actual database connections. Run tests with:

```
npx jest
```

### Example Test Case

Here’s an example of a test case for `executeDDL`:

```javascript
it('should execute a DDL query successfully', async () => {
  mockPoolClient.query.mockResolvedValueOnce({} as QueryResult);

  await sqlClient.executeDDL('CREATE TABLE test_table (id SERIAL PRIMARY KEY)');

  expect(mockPoolClient.query).toHaveBeenCalledWith('CREATE TABLE test_table (id SERIAL PRIMARY KEY)', []);
  expect(mockLogger.info).toHaveBeenCalledWith('DDL query executed successfully.');
});
```

## License

This project is open-source and available under the MIT License.
