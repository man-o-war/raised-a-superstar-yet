# Raised A Superstar Yet

This project implements a REST API for serving day-wise activity plans that are consumed by a mobile application or website. The API allows users to manage activities and plans—including creating, reading, updating, and deleting activities and plans with nested day and activity mappings.

## Table of Contents

- [Raised A Superstar Yet](#raised-a-superstar-yet)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Technology Stack](#technology-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
      - [Optional Steps (DB is there, pre-seeded so, if clean state is req then)](#optional-steps-db-is-there-pre-seeded-so-if-clean-state-is-req-then)
  - [API Endpoints](#api-endpoints)
    - [Activities](#activities)
    - [Plans](#plans)
      - [For easy testing, I have provided a json file, importable in Postman](#for-easy-testing-i-have-provided-a-json-file-importable-in-postman)
  - [Available Scripts](#available-scripts)
  - [Environment Variables](#environment-variables)
  - [Error Handling](#error-handling)
  - [Further Enhancements](#further-enhancements)
  - [License](#license)

## Overview

This backend service provides endpoints for:

- Activity management (CRUD operations)
- Plan management with nested day-to-activity mappings
- Retrieving activities for a specific day within a plan
- Updating the plan name or the activities for a given day

Error handling is built in for scenarios such as invalid activity IDs or constraint violations, ensuring that the client receives helpful messages.

## Technology Stack

- **Node.js** with **Express**
- **TypeScript** for strong typing and maintainability
- **Prisma** as the ORM with **SQLite** for a lightweight database
- **dotenv** for environment configuration
- **Nodemon** for automatic server restarts during development

## Getting Started

Follow these steps to set up the project on your system.

### Prerequisites

- Node.js (v20.x or newer)
- npm (Latest LTS)

### Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-link>
    cd raised-a-superstar-yet
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables:**

    Create a `.env` file in the root directory with the following content:

    ```text
    DATABASE_URL="file:./dev.db"
    PORT=3000
    ```

4. **Start the application in development mode:**

    ```bash
    npm run dev
    ```

The API should now be accessible at [http://localhost:3000](http://localhost:3000).

#### Optional Steps (DB is there, pre-seeded so, if clean state is req then)

1. **Generate Prisma Client:**

    Even if you are not provided with migration files, generate the Prisma client:

    ```bash
    npx prisma generate
    ```

2. **Run Migrations:**

    To create the database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

## API Endpoints

Below is a brief description of the available endpoints:

### Activities

- **GET /api/activities**  
  Retrieves all available activities.

- **GET /api/activities/:id**  
  Fetches a specific activity by ID.

- **POST /api/activities**  
  Creates a new activity.  
  _Required fields:_ `taskName`, `category`, and optional frequency/time parameters.

- **PUT /api/activities/:id**  
  Updates an existing activity's details.

- **DELETE /api/activities/:id**  
  Deletes an activity if it's not mapped to any plan. Returns an error if the activity is in use.

### Plans

- **POST /api/plans**  
  Creates a new plan along with its day-wise activity mappings.  
  _Example Request Body:_

```json
{
  "name": "2-Day Starter Plan",
  "totalDays": 2,
  "planDays": [
    { "dayNumber": 1, "activities": [{ "activityId": 1 }] },
    { "dayNumber": 2, "activities": [{ "activityId": 1 }, { "activityId": 2 }] }
  ]
}
```

- **GET /api/plans**  
  Retrieves all plans (basic details only).

- **GET /api/plans/:id**  
  Fetches basic details of a specific plan.

- **GET /api/plans/:id/activities**  
  Retrieves the full plan, including all days and their mapped activities.

- **GET /api/plans/:planId/day/:dayNumber**  
  Fetches activities for a specific day in a plan.

- **PATCH /api/plans/:id/name**  
  Updates only the name of a plan.

- **PUT /api/plans/:planId/day/:dayNumber/activities**  
  Updates the activities mapped to a specific day.

- **DELETE /api/plans/:id**  
  Deletes a plan and all its associated day and activity mappings.

#### For easy testing, I have provided a json file, importable in Postman

## Available Scripts

In the project directory, you can run:

- **`npm run dev`**  
  Runs the app in development mode with hot-reloading using nodemon.

- **`npm run build`**  
  Compiles the TypeScript source code to JavaScript.

- **`npm run start`**  
  Starts the application in production mode (after building).

## Environment Variables

The project uses a `.env` file for configuration. The following variables are required:

- `DATABASE_URL` – Connection string for the SQLite database (e.g., `file:./dev.db`)
- `PORT` – The port number on which the server will run (default is 3000)

## Error Handling

Each endpoint implements robust error handling and validation:

- Returns 400-level errors for validation issues (e.g., invalid activity IDs, duplicate day numbers)
- Uses transactions for multi-step operations to ensure data consistency
- Provides detailed error messages to help diagnose the issue

## Further Enhancements

- Add authentication and authorization
- Implement caching strategies for frequently accessed endpoints
- Add comprehensive integration and unit tests
- Enhance logging and monitoring

## License

This project is licensed under the MIT License.
