### Introduction

Apart from using the `pg` library to interact with PostgreSQL from Node.js, you can also use the `psql` command-line interface to interact with your PostgreSQL databases directly. This section will cover some basic `psql` and PostgreSQL server commands.

## Starting and Stopping PostgreSQL

First, let's look at how to start and stop the PostgreSQL server.

### Starting PostgreSQL

To start the PostgreSQL server, use the following command:

```sh
# Start PostgreSQL (Homebrew on Mac)
brew services start postgresql@16

# Or using the pg_ctl command
pg_ctl -D '/usr/local/var/postgresql@16' -l logfile start
```

### Stopping PostgreSQL

To stop the PostgreSQL server, use the following command:

```sh
# Stop PostgreSQL (Homebrew on Mac)
brew services stop postgresql@16

# Or using the pg_ctl command
pg_ctl -D '/usr/local/var/postgresql@16' stop
```

## Basic `psql` Commands

`psql` is the interactive terminal for working with PostgreSQL. Here are some basic commands to get you started.

### Connecting to a Database

To connect to a PostgreSQL database using `psql`, use the following command:

```sh
psql -d mydatabase -U myuser
```

Replace `mydatabase` with your database name and `myuser` with your username.

### Listing Databases

To list all databases, use the `\l` command:

```sh
\l
```

### Listing Tables

To list all tables in the current database, use the `\dt` command:

```sh
\dt
```

### Viewing Table Schema

To view the schema of a specific table, use the `\d` command followed by the table name:

```sh
\d users
```

### Executing SQL Queries

You can execute SQL queries directly in `psql`. For example, to select all rows from the `users` table:

```sql
SELECT * FROM users;
```

### Inserting Data

To insert data into a table, use the `INSERT` command:

```sql
INSERT INTO users (name, email) VALUES ('John Doe', 'john.doe@example.com');
```

### Inserting with Javascript
```sql
db.query("INSERT INTO tablename (col1, col2, col3) VALUES ($1, $2, $3)", [val1, val2, val3]);
```

### Updating Data

To update data in a table, use the `UPDATE` command:

```sql
UPDATE users SET email = 'john.updated@example.com' WHERE name = 'John Doe';
```

### Deleting Data

To delete data from a table, use the `DELETE` command:

```sql
DELETE FROM users WHERE name = 'John Doe';
```

### Exiting `psql`

To exit the `psql` interface, use the `\q` command:

```sh
\q
```

## Managing Roles and Databases

### Creating a New Database

To create a new database, use the following command:

```sh
createdb mynewdatabase
```

### Creating a New User

To create a new user, use the `createuser` command:

```sh
createuser mynewuser --interactive
```

This command will prompt you to specify whether the new user should have superuser privileges and other settings.

### Granting Privileges

To grant privileges to a user on a specific database, use the following SQL command in `psql`:

```sql
GRANT ALL PRIVILEGES ON DATABASE mynewdatabase TO mynewuser;
```

## Examples from Recent Session

Here are some practical examples based on a recent session:

### Creating a Role and Database

```sh
# Start PostgreSQL
brew services start postgresql@16

# Connect to PostgreSQL
psql postgres

# Create a new role with login and password
CREATE ROLE edhe_user WITH LOGIN PASSWORD 'edward0823';

# Grant createdb privilege to the new role
ALTER ROLE edhe_user CREATEDB;

# List all roles
\du

# Exit psql
\q
```

### Connecting with the New User and Creating a Database

```sh
# Connect to PostgreSQL as the new user
psql postgres -U edhe_user

# Create a new database
CREATE DATABASE demo_database;

# List all databases
\l

# Connect to the new database (Note: Fix the database name if it doesn't exist)
\connect demo_database;

# If connection fails due to non-existent database, ensure the database name is correct
```

### Additional psql Commands

```sh
# List large objects (though often empty unless used)
\dl
```

## Conclusion

By using the `psql` command-line interface and PostgreSQL server commands, you can perform a wide range of database management tasks. This is useful for initial setup, maintenance, and debugging purposes. Combining these skills with the ability to interact with PostgreSQL from a Node.js application will make you a more versatile developer.