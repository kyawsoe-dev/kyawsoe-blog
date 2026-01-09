---
title: NestJS Architecture Patterns
description: Deep dive into advanced architectural patterns and best practices for building scalable NestJS applications
pubDate: 2025-01-15
author: Kyaw Soe
tags: ['nestjs', 'nodejs', 'typescript', 'backend', 'architecture', 'patterns']
category: 'Backend Development'
technology: 'NestJS'
level: 'intermediate'
readingTime: 12
layout: '../../layouts/NestJSBlogSeriesLayout.astro'
---

<div class="blog-meta-enhanced">

<span class="tech-badge">NestJS</span>
<span class="level-badge level-intermediate">Intermediate</span>

</div>

Understanding architectural patterns is crucial for building scalable and maintainable NestJS applications. This guide explores advanced patterns and best practices for structuring your applications.

---

## Common NestJS Architecture Patterns

### 1. Layered Architecture

The most common pattern in NestJS applications separates concerns into distinct layers:

```
┌─────────────────┐
│   Presentation  │ ← Controllers
├─────────────────┤
│   Business Logic│ ← Services/Providers
├─────────────────┤
│   Data Access   │ ← Repositories/DAOs
├─────────────────┤
│   External APIs │ ← HTTP Clients, SDKs
└─────────────────┘
```

### 2. Domain-Driven Design (DDD)

Organize your application around business domains:

```typescript
// domain/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserDomainModule {}
```

### 3. CQRS Pattern

Separate read and write operations using Command Query Responsibility Segregation:

```typescript
// commands/create-user.command.ts
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
  ) {}
}

// handlers/create-user.handler.ts
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand) {
    // Handle the command
    const { name, email } = command;
    // ... business logic
  }
}
```

## Advanced Module Organization

### Feature Modules

Structure your application with dedicated modules for each feature:

```typescript
// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
```

### Shared Modules

Create reusable modules for common functionality:

```typescript
// shared/shared.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    LoggerModule,
  ],
  exports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
  ],
})
export class SharedModule {}
```

## Microservices Architecture

For complex applications, consider a microservices approach:

```typescript
// user-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UserModule } from './user.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UserModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 8877,
    },
  });
  await app.listen();
}
bootstrap();
```

## Cross-Cutting Concerns

### Interceptors for Cross-Cutting Logic

```typescript
// interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, call$: Observable<any>): Observable<any> {
    const now = Date.now();
    const method = context.getHandler().name;
    const controller = context.getClass().name;

    console.log(`Before [${controller}:${method}]`);

    return call$.pipe(
      tap(() => console.log(`After [${controller}:${method}] (${Date.now() - now}ms)`)),
    );
  }
}
```

### Guards for Authorization

```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

## Performance Optimization Patterns

### Lazy Loading Modules

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Import modules lazily when needed
    UsersModule,
    PostsModule,
    // Load admin module only when needed
    AdminModule.registerAsync({
      useFactory: () => ({
        // Configuration for admin module
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### Caching Strategies

```typescript
// services/cache.service.ts
import { Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}
```

## Testing Architecture

### Integration Testing Setup

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## Best Practices Summary

1. **Modularity**: Keep modules focused on single responsibilities
2. **Dependency Injection**: Leverage NestJS DI system effectively
3. **Separation of Concerns**: Separate business logic from infrastructure
4. **Consistent Naming**: Follow consistent naming conventions
5. **Error Handling**: Implement centralized error handling
6. **Configuration Management**: Use ConfigService for environment variables
7. **Testing**: Maintain high test coverage across all layers

These architectural patterns will help you build robust, scalable, and maintainable NestJS applications that can grow with your business requirements.