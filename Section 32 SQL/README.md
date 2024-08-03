# Section 32: SQL

## Main Things To Do with Database
    - CREATE
    - READ
    - UPDATE
    - DESTROY

## Create Table Syntax

First you need to set up a database:

```sql
CREATE DATABASE databasename;
```

Then you can start creating a table:

```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    column3 datatype,
    ....
);
```

---

## Main Operations with Databases

In SQL, the primary operations you can perform on a database are commonly referred to as CRUD:
- **CREATE**: Add new records or tables.
- **READ**: Retrieve data from the database.
- **UPDATE**: Modify existing records.
- **DELETE**: Remove records from the database.

## Creating a Database

Before creating tables, you need to set up a database using the `CREATE DATABASE` statement:

```sql
CREATE DATABASE database_name;
```

Replace `database_name` with the name you want for your database.

## Creating Tables

Once the database is created, you can start creating tables. A table in SQL is a collection of related data entries and it consists of columns and rows. Use the `CREATE TABLE` statement to create a new table:

```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    column3 datatype,
    ...
);
```

- `table_name`: The name of the table you want to create.
- `column1`, `column2`, `column3`: The names of the columns in the table.
- `datatype`: The type of data that each column can hold.

### Example

Here's an example of creating a table called `employees`:

```sql
CREATE TABLE employees (
    id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    birth_date DATE,
    salary DECIMAL(10, 2)
);
```

This creates a table `employees` with the following columns:
- `id`: An integer representing the employee ID.
- `first_name`: A variable character string up to 50 characters long for the employee's first name.
- `last_name`: A variable character string up to 50 characters long for the employee's last name.
- `birth_date`: A date field for the employee's birth date.
- `salary`: A decimal number with up to 10 digits, 2 of which can be after the decimal point, for the employee's salary.

## Common SQL Data Types

Here are some common data types used in SQL:

- **INT**: Integer, a whole number without a decimal.
- **VARCHAR(size)**: Variable-length character string. `size` defines the maximum number of characters.
- **CHAR(size)**: Fixed-length character string. `size` defines the number of characters.
- **TEXT**: A large amount of text data.
- **DATE**: Date value in the format `YYYY-MM-DD`.
- **DATETIME**: Date and time value in the format `YYYY-MM-DD HH:MM:SS`.
- **TIME**: Time value in the format `HH:MM:SS`.
- **DECIMAL(p, s)**: Decimal number with precision `p` and scale `s`. `p` is the total number of digits, and `s` is the number of digits after the decimal point.
- **FLOAT**: Single-precision floating-point number.
- **DOUBLE**: Double-precision floating-point number.
- **BOOLEAN**: Boolean value, which can be `TRUE` or `FALSE`.
- **BLOB**: Binary large object, used to store binary data like images or files.

These data types allow you to define what kind of data each column in your table will hold, ensuring that the data stored is accurate and appropriately formatted.