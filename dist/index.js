"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_pg = require("pg");
var SqlClient = class {
  pool;
  logger;
  constructor(options, logger) {
    this.pool = new import_pg.Pool({ ...options, ssl: true });
    this.logger = logger || console;
  }
  /**
   * Validates if the query starts with any of the allowed keywords.
   * @param query - The SQL query string to validate.
   * @param allowedCommands - Array of allowed SQL commands for the method.
   */
  validateQuery(query, allowedCommands) {
    const command = query.trim().split(" ")[0].toUpperCase();
    if (!allowedCommands.includes(command)) {
      throw new Error(
        `Invalid SQL command: ${command}. Allowed commands are: ${allowedCommands.join(", ")}`
      );
    }
  }
  /**
   * DDL - Executes a Data Definition Language statement
   * @param query - The SQL query string for DDL operations
   * @param params - Optional parameters for parameterized queries
   */
  async executeDDL(query, params = []) {
    this.validateQuery(query, ["CREATE", "ALTER", "DROP", "TRUNCATE"]);
    const client = await this.pool.connect();
    try {
      await client.query(query, params);
      this.logger.info("DDL query executed successfully.");
    } catch (error) {
      this.logger.error("Error executing DDL query:", error);
      throw error;
    } finally {
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
    this.validateQuery(query, ["SELECT"]);
    const client = await this.pool.connect();
    try {
      if (many) {
        const offset = (page - 1) * limit;
        query = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
      }
      const result = await client.query(query, params);
      this.logger.info("DQL query executed successfully.");
      return result.rows;
    } catch (error) {
      this.logger.error("Error executing DQL query:", error);
      throw error;
    } finally {
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
    this.validateQuery(query, ["INSERT", "UPDATE", "DELETE"]);
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      this.logger.info("DML query executed successfully.");
      return result.rowCount ?? 0;
    } catch (error) {
      this.logger.error("Error executing DML query:", error);
      throw error;
    } finally {
      client.release();
    }
  }
  /**
   * Closes the connection pool gracefully
   */
  async closePool() {
    await this.pool.end();
    this.logger.info("Connection pool closed.");
  }
};
var src_default = SqlClient;
