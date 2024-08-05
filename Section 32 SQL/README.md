# Section 32: SQL

## Main Things To Do with Database
    - CREATE
    - READ
    - UPDATE
    - DELETE

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

## Dropping a Database

If you need to delete a database, use the `DROP DATABASE` statement. This will permanently remove the database and all its data:

```sql
DROP DATABASE database_name;
```

Replace `database_name` with the name of the database you want to delete. **Note:** This action is irreversible, so use it with caution.

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

---

## Inserting Data into Tables

To add rows to a table, use the `INSERT INTO` statement:

### Syntax

```sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

### Example

```sql
INSERT INTO employees (id, first_name, last_name, birth_date, salary)
VALUES (1, 'John', 'Doe', '1980-01-15', 60000.00);
```

This inserts a new row into the `employees` table with the specified values.

---

## Reading Data from Tables

To retrieve data from a table, use the `SELECT` statement:

### Syntax

```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

```sql
SELECT <COLUMN> FROM <TABLE>
```

### Example

```sql
SELECT first_name, last_name, salary
FROM employees
WHERE salary > 50000;
```

This retrieves the first name, last name, and salary of employees who earn more than 50,000.

---

## Updating Data in Tables

To modify existing records, use the `UPDATE` statement:

### Syntax

```sql
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
```

### Example

```sql
UPDATE employees
SET salary = 65000.00
WHERE id = 1;
```

This updates the salary of the employee with ID 1 to 65,000.

---

## Deleting Data from Tables

To remove records from a table, use the `DELETE` statement:

### Syntax

```sql
DELETE FROM table_name
WHERE condition;
```

### Example

```sql
DELETE FROM employees
WHERE id = 1;
```

This deletes the record of the employee with ID 1.

---

## Dropping Tables

To remove an entire table, use the `DROP TABLE` statement:

### Syntax

```sql
DROP TABLE table_name;
```

### Example

```sql
DROP TABLE employees;
```

This deletes the `employees` table from the database.

---

## Modifying Tables

To modify the structure of an existing table, use the `ALTER TABLE` statement:

### Adding a Column

```sql
ALTER TABLE table_name
ADD column_name datatype;
```

### Example

```sql
ALTER TABLE employees
ADD email VARCHAR(100);
```

This adds a new column `email` to the `employees` table.

### Dropping a Column

```sql
ALTER TABLE table_name
DROP COLUMN column_name;
```

### Example

```sql
ALTER TABLE employees
DROP COLUMN birth_date;
```

This removes the `birth_date` column from the `employees` table.

### Modifying a Column

```sql
ALTER TABLE table_name
MODIFY COLUMN column_name new_datatype;
```

### Example

```sql
ALTER TABLE employees
MODIFY COLUMN salary DECIMAL(12, 2);
```

This changes the `salary` column in the `employees` table to a decimal with 12 digits, 2 of which can be after the decimal point.

---

## Adding Comments

Comments can be added in SQL for clarity and documentation. They are ignored by the SQL engine.

### Single-Line Comment

```sql
-- This is a single-line comment
SELECT * FROM employees;
```

### Multi-Line Comment

```sql
/*
This is a
multi-line comment
*/
SELECT * FROM employees;
```

---

## Understanding SQL Relationships, Foreign Keys, and Joins

In relational databases, relationships are established between tables using foreign keys. Joins are used to retrieve data from multiple tables based on these relationships.

### Foreign Keys

A foreign key is a column or a set of columns in one table that uniquely identifies a row in another table. It establishes a relationship between the two tables.

### Syntax

```sql
CREATE TABLE table_name (
    column1 datatype PRIMARY KEY,
    column2 datatype,
    column3 datatype,
    ...
    FOREIGN KEY (foreign_key_column) REFERENCES parent_table(primary_key_column)
);
```

### Example

Consider two tables, `departments` and `employees`:

```sql
CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(50)
);

CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

In this example, `department_id` in the `employees` table is a foreign key that references `department_id` in the `departments` table, establishing a relationship between the two tables.

### Inner Joins

An inner join retrieves records that have matching values in both tables. It combines rows from two or more tables based on a related column between them.

### Syntax

```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.column = table2.column;
```

### Example

```sql
SELECT employees.first_name, employees.last_name, departments.department_name
FROM employees
INNER JOIN departments
ON employees.department_id = departments.department_id;
```

This query retrieves the first name, last name, and department name of all employees, combining data from the `employees` and `departments` tables based on the matching `department_id`.

### Other Types of Joins

- **LEFT JOIN**: Retrieves all records from the left table and the matched records from the right table.
- **RIGHT JOIN**: Retrieves all records from the right table and the matched records from the left table.
- **FULL JOIN**: Retrieves all records when there is a match in either left or right table

.

### Example of LEFT JOIN

```sql
SELECT employees.first_name, employees.last_name, departments.department_name
FROM employees
LEFT JOIN departments
ON employees.department_id = departments.department_id;
```

This retrieves all employees and their corresponding department names, including those without a matching department.

### Example of FULL JOIN

```sql
SELECT employees.first_name, employees.last_name, departments.department_name
FROM employees
FULL JOIN departments
ON employees.department_id = departments.department_id;
```

This retrieves all employees and departments, showing nulls where there is no match.