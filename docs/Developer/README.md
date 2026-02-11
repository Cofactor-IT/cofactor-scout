# Developer Documentation

Welcome to the **Cofactor Club** technical documentation. This section is designed for engineers, contributors, and maintainers.

## Table of Contents

*   [**Architecture & Tech Stack**](./Architecture.md)
    *   High-level system design.
    *   Next.js App Router structure.
    *   Key libraries (Prisma, NextAuth, etc.).

*   [**Database & Schema**](./Database.md)
    *   PostgreSQL schema overview.
    *   Entity relationships (University -> Institute -> Lab).
    *   User and Role data models.

*   [**Wiki Engine Internals**](./Wiki-Engine.md)
    *   How the revision system works.
    *   Diffing algorithm and version control.
    *   `@` mentions parsing and linking logic.
    *   Content sanitization (XSS protection).

*   [**Auth & Security**](./Auth-Security.md)
    *   Authentication flow with NextAuth.
    *   Role-Based Access Control (RBAC) middleware.
    *   University email domain verification.

*   [**Deployment**](./Deployment.md)
    *   Docker setup and orchestration.
    *   ARM64 optimization for Oracle Cloud.
    *   Environment variables and configuration.

## Getting Started

To spin up the development environment, refer to the [main README](../../README.md#-local-development).
