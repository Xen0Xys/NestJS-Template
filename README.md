# NestJS-Template

## Overview

NestJS-Template is a boilerplate project for building scalable and maintainable APIs using NestJS and Prisma. This template provides a solid foundation with a modular architecture, pre-configured Prisma integration, and essential features to help you quickly start your project.

## Features

- **NestJS**: A progressive Node.js framework for building efficient and reliable server-side applications.
- **Prisma**: A modern ORM that simplifies database access with type safety and auto-generated queries.
- **Modular Architecture**: Encourages separation of concerns and promotes code reusability.
- **Environment Configuration**: Easy management of environment-specific variables.
- **Pre-configured Auth Module**: Includes JWT-based authentication and role-based authorization.
- **Swagger Integration**: Auto-generated API documentation with Swagger.
- **Validation & Error Handling**: Centralized validation and error handling for better maintainability.
- **Testing Setup**: Unit and e2e tests configured using Jest.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher) or yarn
- PostgreSQL (or any other supported database)

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/NestJS-Template.git
    cd NestJS-Template
    ```
2. Install dependencies:
    ```bash
    pnpm install
    ```
3. Set up the database:
   - Create a .env file in the root directory from the .env.example file and update the database credentials.
   - Run the Prisma migration to create the database schema:
    ```bash
    pnpx prisma migrate dev
    ```
### Running the Application
- Start the development server:
    ```bash
    pnpm run start:dev
    ```
- The application will be running at `http://localhost:3000`.

### Swagger API Documentation
- After starting the server, access the API documentation at `http://localhost:3000/api`.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

### Future features
- Implement proper testing
- Implement Websockets example

## License
This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
