# App Directory Structure & Agent Guidelines

This document outlines the purpose of each directory in this monorepo to help agents understand the architecture and properly navigate the codebase.

## `packages/` Directory

This project is structured as a monorepo containing several microservices and a frontend application.

*   **`api-gateway/`**: The central entry point for all client requests. It proxies incoming traffic to the appropriate backend microservices.
*   **`bot-service/`**: Contains the logic for the English learning AI bot and its conversational capabilities.
*   **`frontend/`**: The user interface application, built with React and Vite.
*   **`game-service/`**: Manages the gamification features, such as points, levels, or achievements.
*   **`reporting-service/`**: Handles data analytics, reporting, and tracking user progress/statistics.
*   **`user-service/`**: Manages user authentication, account details, and profile data.

## Adding a New Service

When an agent is tasked with adding a new microservice to this project, follow this TODO list:

- [ ] **Create the Service Directory**: Add a new folder under `packages/` (e.g., `packages/new-feature-service`).
- [ ] **Initialize `package.json`**: Set up a new Node.js project within the new directory and define its dependencies.
- [ ] **Configure the Service**: Set up Express (or the chosen framework), database connections, and environment variables.
- [ ] **Update API Gateway**: Modify `packages/api-gateway/index.js` to add proxy routing rules for the new service.
- [ ] **Update Monorepo Configuration**: Add the new service to the root `package.json` development scripts. Update the `concurrently` command for `npm run dev` so the new service starts up automatically with the others.
- [ ] **Document the Service**: Update this document (`docs/agent_guidelines.md`) to include the new service's purpose.

## Frontend Features Directory (`packages/frontend/src/features`)

The frontend application employs a feature-based architecture. Each feature is self-contained and encapsulates its own domain. Currently, the following features are implemented:

*   **`bot/`**: Interfaces with the AI bot backend, managing chat UI and interaction logic.
*   **`game/`**: Handles gamification components such as points, levels, and user achievements.
*   **`learning-studio/`**: The core learning environment where users engage with English lessons, practice sessions, and track their progress.
*   **`user/`**: Manages user-related UI components, including authentication (login/register) and profile management.

### Current Internal Feature Structure

Within each feature, the codebase is further divided using a layered approach:
*   **`data/`**: Responsible for data fetching, API clients, and services.
*   **`logic/`**: Contains business logic, state management, and custom React hooks.
*   **`presentation/`**: Houses React UI components and styles.

### Suggested Structure Improvements

While the `data`/`logic`/`presentation` split (inspired by Clean Architecture) strictly separates concerns, it can sometimes lead to excessive nesting and fragmentation in React applications. 

A more idiomatic "Feature Slice" structure for React applications is often recommended to reduce friction and improve standard discoverability:

```text
features/feature-name/
├── api/         # API requests (e.g., RTK Query endpoints, Axios calls)
├── components/  # Presentational and container components specific to this feature
├── hooks/       # Custom React hooks (equivalent to `logic`)
├── store/       # State management (e.g., Redux slices, Context providers)
└── utils/       # Utility functions specific to the feature
```

Transitioning to this standard structure can reduce directory boilerplate and align closer with modern React ecosystem practices.
