---
title: Getting Started with NestJS
description: Learn how to build scalable and maintainable applications with NestJS framework.
pubDate: 2025-01-15
author: Kyaw Soe
tags: ['nestjs', 'nodejs', 'typescript', 'backend', 'framework']
category: 'Backend Development'
technology: 'NestJS'
level: 'beginner'
readingTime: 8
layout: '../../layouts/NestJSBlogSeriesLayout.astro'
---

<div class="blog-meta-enhanced">

<span class="tech-badge">NestJS</span>
<span class="level-badge level-beginner">Beginner</span>

</div>

NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses TypeScript and combines elements of OOP, FP, and FRP.

---

## Why NestJS?

NestJS provides:
- Architecture based on Angular
- Dependency injection
- Modular structure
- Built-in support for TypeScript
- Robust testing capabilities
- Integration with various libraries (Express/Fastify)

## Installation

First, make sure you have Node.js installed on your system. Then install the NestJS CLI globally:

```bash
npm install -g @nestjs/cli
```

Create a new NestJS project:

```bash
nest new my-nestjs-app
cd my-nestjs-app
```

The CLI will create a new project with the basic structure and install all necessary dependencies.

## Project Structure

When you create a new NestJS project, you'll see the following structure:

```
my-nestjs-app/
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── node_modules/
├── package.json
├── nest-cli.json
└── tsconfig.json
```

- `main.ts`: The entry point of your application
- `app.module.ts`: The root module of your application
- `app.controller.ts`: A basic controller with a route
- `app.service.ts`: A basic service with business logic

## Running the Application

To start your application in development mode:

```bash
npm run start:dev
```

Your application will be available at `http://localhost:3000`.

## Core Concepts

### 1. Modules

Modules are classes annotated with `@Module()`. They provide metadata that helps Nest organize the application structure.

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 2. Controllers

Controllers handle incoming requests and return responses to the client.

```typescript
// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### 3. Services (Providers)

Services contain the business logic of your application and can be injected into controllers.

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

## Creating Your First Feature

Let's create a simple user feature to understand how different parts work together:

### 1. Generate a User Module

```bash
nest generate module user
nest generate service user
nest generate controller user
```

### 2. Define a User Interface

```typescript
// user/interfaces/user.interface.ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

### 3. Update the User Service

```typescript
// user/user.service.ts
import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    return this.users.find(user => user.id === id);
  }
}
```

### 4. Update the User Controller

```typescript
// user/user.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
```

### 5. Register the Service in the Module

```typescript
// user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

### 6. Import the User Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Now you can access your API at:
- `GET http://localhost:3000/users` - Get all users
- `GET http://localhost:3000/users/1` - Get user with ID 1

## Dependency Injection

NestJS has a powerful dependency injection system. You can inject services into other services or controllers by specifying them in the constructor:

```typescript
// user/user.service.ts
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service'; // hypothetical logger service

@Injectable()
export class UserService {
  constructor(private logger: LoggerService) {}

  findAll() {
    this.logger.log('Fetching all users');
    // ... implementation
  }
}
```

## Environment Variables

For configuration, NestJS supports environment variables through the ConfigModule:

```bash
npm install @nestjs/config
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

You can then use environment variables in your services:

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }
}
```

## Testing

NestJS has excellent testing support built-in. You can run tests with:

```bash
npm run test
npm run test:watch  # for watch mode
npm run test:cov    # for coverage report
```

Create a simple test for your service:

```typescript
// user/user.service.spec.ts
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Next Steps

Now that you have a basic understanding of NestJS, you can explore:
- Database integration with TypeORM or Mongoose
- Authentication and authorization
- Validation with class-validator
- Exception handling
- Middleware and guards
- Microservices architecture

NestJS provides a solid foundation for building scalable and maintainable backend applications with TypeScript.