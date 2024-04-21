**Error When Passing Models with `@computed()` or Pagination to Inertia.js**

This repository has been created to demonstrate an error that occurs when passing models containing `@computed()` or when using pagination with Inertia.js in AdonisJS projects.

**Steps to Reproduce the Error:**

1. Clone this repository to your local environment:

```bash
git clone https://github.com/lncitador/computed-and-pagination-error.git
```

2. Navigate to the project directory:

```bash
cd computed-and-pagination-error
```

3. Install project dependencies:

```bash
npm install

4. Run migrations to create the database schema:

```bash
node ace migration:run
```

5. Run the seeder to generate example data:

```bash
node ace db:seed
```

6. Start the AdonisJS server:

```bash
node ace serve --watch
```

7. Open your browser and navigate to `http://localhost:3333` to view the application.

**Note:**

You will notice that when attempting to pass models containing `@computed()` or when using pagination, an error occurs within the `@adonisjs/inertiajs` package.

Feel free to explore the source code and contribute to a potential solution.

If you need further information or assistance, please don't hesitate to reach out.

Thank you for your collaboration!

Best regards,
Walaff Fernandes
