# PostgreSQL Database Management

## Connecting to PostgreSQL

1. **Start the PostgreSQL service**:
   ```sh
   brew services start postgresql
   ```

2. **Connect to PostgreSQL using the `psql` command-line interface**:
   ```sh
   psql -U edwardhe -h localhost -d postgres
   ```

## Setting or Changing the Password for a Role

1. **Set or change the password for the `edwardhe` role**:
   ```sql
   \password edwardhe
   ```
   Follow the prompts to enter and confirm the new password.

## Creating and Managing Databases

1. **Create a new database**:
   ```sql
   CREATE DATABASE demo_database;
   ```

2. **List all databases**:
   ```sql
   \l
   ```

3. **Connect to a specific database**:
   ```sql
   \connect demo_database
   ```

4. **Create a table in the connected database**:
   ```sql
   CREATE TABLE games ();
   ```

5. **Drop (delete) a table in the connected database**:
   ```sql
   DROP TABLE games;
   ```

## Dropping (Deleting) a Database

1. **Connect to PostgreSQL (ensure you are not connected to the database you want to drop)**:
   ```sh
   psql -U edwardhe -h localhost -d postgres
   ```

2. **Drop the database**:
   ```sql
   DROP DATABASE demo_database;
   ```

## Exiting the `psql` Shell

1. **Exit the `psql` shell**:
   ```sql
   \q
   ```

## Complete Example Workflow

1. **Start the PostgreSQL service**:
   ```sh
   brew services start postgresql
   ```

2. **Connect to PostgreSQL**:
   ```sh
   psql -U edwardhe -h localhost -d postgres
   ```

3. **Set or change the password for the `edwardhe` role**:
   ```sql
   \password edwardhe
   ```

4. **Create a new database**:
   ```sql
   CREATE DATABASE demo_database;
   ```

5. **Connect to the new database**:
   ```sql
   \connect demo_database
   ```

6. **Create a table in the new database**:
   ```sql
   CREATE TABLE games ();
   ```

7. **Drop the table**:
   ```sql
   DROP TABLE games;
   ```

8. **Connect back to the `postgres` database**:
   ```sql
   \connect postgres
   ```

9. **Drop the newly created database**:
   ```sql
   DROP DATABASE demo_database;
   ```

10. **Exit the `psql` shell**:
    ```sql
    \q
    ```