# E-Commerce NestJS API

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-%23E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
  <img alt="AWS S3" src="https://img.shields.io/badge/AWS%20S3-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-UNLICENSED-red?style=for-the-badge" />
</p>

E-Commerce NestJS API is a backend service for an e-commerce platform built with MongoDB, JWT authentication, Redis-backed OTP flows, Stripe payments, and AWS S3 media handling.

The application handles catalog management, user accounts, cart and order processing, coupons, addresses, wishlist logic, and payment flows. It is organized as a modular API service and does not include a separate frontend application.

## Overview

The application is built around a MongoDB-backed commerce domain with catalog management, user authentication, cart and wishlist flows, coupon handling, address management, and order processing. It is structured as a modular service for storefront and admin workflows rather than a full frontend application.

The service includes:

- user registration, login, email verification, password reset, and Google sign-in flows
- catalog management for categories, subcategories, brands, and products
- cart and wishlist features tied to authenticated users
- order creation for cash and card-based payment flows
- coupon application and cart discount handling
- media uploads through AWS S3 and signed URLs
- Redis-backed OTP and token blacklist functionality
- Stripe checkout and refund integration

### Quick summary

| Area | Details |
| --- | --- |
| Runtime | Node.js + NestJS + TypeScript |
| Database | MongoDB with Mongoose |
| Cache / OTP | Redis |
| Auth | JWT, bcrypt, Google ID token verification |
| Storage | AWS S3 |
| Payments | Stripe |
| Email | Nodemailer |
| Validation | class-validator |

---

## ✨ Key Features

- JWT-based authentication and role-aware authorization
- Email OTP verification and password reset flows
- Google OAuth-based signup/login via Google ID token verification
- Admin catalog management for categories, subcategories, brands, and products
- User profile management and media upload support
- Cart, address, wishlist, and order lifecycle management
- Product filtering by category, subcategory, brand, and price range
- AWS S3 image upload support with signed URLs
- Stripe card payment session creation and refund support
- Redis-based OTP throttling, blocking, and blacklist token checks
- MongoDB Mongoose schema modeling for core commerce entities

---

## 🧩 Tech Stack

| Area | Technology | Notes |
| --- | --- | --- |
| API framework | NestJS | Main application framework |
| Runtime | Node.js / TypeScript | TypeScript application compiled with Nest CLI |
| Database | MongoDB + Mongoose | Primary persistence layer |
| Cache / OTP storage | Redis | Used for OTP keys, blacklist tokens, and rate limiting behavior |
| Authentication | JWT + bcrypt + custom guards | Access/refresh token validation and password hashing |
| Validation | class-validator | DTO validation and custom matcher validation |
| Email | nodemailer | Sends verification and password reset emails |
| Storage | AWS S3 SDK | Media uploads, signed URLs, file deletion |
| Payments | Stripe | Checkout session creation and refunds |
| Google login | google-auth-library | Verifies Google ID tokens |
| File handling | multer | Upload middleware for product and user media |

---

## 🏗️ Architecture and Project Structure

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── config/
│   └── config.service.ts
├── common/
│   ├── decorator/
│   ├── enum/
│   ├── guard/
│   ├── interceptor/
│   ├── middleware/
│   ├── module/
│   ├── pipe/
│   ├── services/
│   ├── utils/
│   └── validation/
├── Models/
│   ├── Address.model.ts
│   ├── Brand.model.ts
│   ├── Cart.model.ts
│   ├── Category.model.ts
│   ├── Coupon.model.ts
│   ├── Order.model.ts
│   ├── Product.model.ts
│   ├── SubCategory.model.ts
│   ├── User.model.ts
│   └── Wishlist.model.ts
├── modules/
│   ├── address/
│   ├── auth/
│   ├── brand/
│   ├── cart/
│   ├── category/
│   ├── coupon/
│   ├── order/
│   ├── product/
│   ├── subcategory/
│   ├── user/
│   └── wishlist/
├── Repo/
│   ├── db.repo.ts
│   ├── product.repo.ts
│   └── user.repo.ts
└── main.ts
```

### Main architectural patterns

- `src/Models` contains the Mongoose schemas for the e-commerce domain.
- `src/modules/*` contains controllers and service logic for each domain area.
- `src/Repo` provides repository abstractions over Mongoose models.
- `src/common` houses shared guards, decorators, interceptors, validation utilities, and service integrations.
- `AppModule` wires together the global config, MongoDB connection, JWT service, and all feature modules.
- The project uses a custom `Auth` decorator with `AuthenticationGuard` and `AuthorizationGuard` to enforce JWT and role checks.

---

## ⚙️ Prerequisites

Before starting the project, make sure you have:

- Node.js and npm installed
- A MongoDB instance or connection URI
- A Redis instance
- Access to an AWS S3 bucket with credentials
- An SMTP-capable email account (Gmail is used in code)
- A Stripe secret key for card flows
- A Google OAuth client ID for Gmail login

---

## 📦 Installation

```bash
git clone <repository-url>
cd nestjs-project-readme-enhancement
npm install
```

Create the required environment files locally before starting the app. The project is configured with `ConfigModule.forRoot({ envFilePath: ['.env.dev', '.env.prod'] })`, so `.env.dev` or `.env.prod` should exist in the project root.

---

## 🔐 Environment Variables

The application reads these variables from environment files. Values below are examples; do not use real credentials in the repository.

| Variable | Required | Purpose | Example |
| --- | --- | --- | --- |
| `PORT` | No | Application port | `3000` |
| `DB_URI_LOCAL` | Yes | MongoDB connection string used by the app | `mongodb://localhost:27017/ecommerce` |
| `DB_URI_ATLAS` | No* | Declared in config, but not currently used in `AppModule` connection setup | `mongodb+srv://user:password@cluster.mongodb.net/ecommerce` |
| `SALT` | Yes | bcrypt salt rounds | `10` |
| `ENCRYPTION_KEY` | Yes | Used for AES encryption/decryption of phone numbers | `replace-with-long-random-key` |
| `TOKEN_SIGNATURE_User_ACCESS` | Yes | JWT secret for user access tokens | `user-access-secret` |
| `TOKEN_SIGNATURE_Admin_ACCESS` | Yes | JWT secret for admin access tokens | `admin-access-secret` |
| `TOKEN_SIGNATURE_User_REFRESH` | Yes | JWT secret for user refresh tokens | `user-refresh-secret` |
| `TOKEN_SIGNATURE_Admin_REFRESH` | Yes | JWT secret for admin refresh tokens | `admin-refresh-secret` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID for Gmail login | `your-google-client-id` |
| `EMAIL_USER` | Yes | SMTP username for Nodemailer | `noreply@example.com` |
| `EMAIL_PASS` | Yes | SMTP password or app password | `smtp-app-password` |
| `REDIS_URL` | Yes | Redis connection URL | `redis://localhost:6379` |
| `REGION` | Yes | AWS region for S3 | `us-east-1` |
| `ACCESS_KEY_ID` | Yes | AWS access key | `AKIA...` |
| `SECRET_ACCESS_KEY` | Yes | AWS secret key | `your-aws-secret-key` |
| `BUCKET_NAME` | Yes | S3 bucket for uploads | `my-app-storage` |
| `APPLICATION_NAME` | Yes | Prefix used in S3 object keys | `my-app` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for payments | `sk_test_...` |

`*` `DB_URI_ATLAS` is defined in `src/config/config.service.ts` but `AppModule` currently creates the MongoDB connection with `DB_URI_LOCAL`.

### Example `.env.dev`

```env
PORT=3000
DB_URI_LOCAL=mongodb://localhost:27017/ecommerce
SALT=10
ENCRYPTION_KEY=replace-with-long-random-key
TOKEN_SIGNATURE_User_ACCESS=user-access-secret
TOKEN_SIGNATURE_Admin_ACCESS=admin-access-secret
TOKEN_SIGNATURE_User_REFRESH=user-refresh-secret
TOKEN_SIGNATURE_Admin_REFRESH=admin-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=noreply@example.com
EMAIL_PASS=smtp-app-password
REDIS_URL=redis://localhost:6379
REGION=us-east-1
ACCESS_KEY_ID=your-access-key-id
SECRET_ACCESS_KEY=your-secret-access-key
BUCKET_NAME=my-app-storage
APPLICATION_NAME=my-app
STRIPE_SECRET_KEY=sk_test_example
```

---

## ▶️ Running the Application

### Development

```bash
npm run start:dev
```

### Production build

```bash
npm run build
npm run start:prod
```

### Other scripts

```bash
npm run start
npm run start:debug
npm run lint
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

> Jest is configured for the project, but there is not yet a comprehensive test suite covering the application.

---

## 📚 API Documentation

Swagger and OpenAPI are not configured for this project. The API is route-based and uses custom NestJS controllers.

### Authentication routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | No | Create a new user account using email and password. |
| `POST` | `/auth/login` | No | Authenticate a user and receive JWT tokens. |
| `POST` | `/auth/verify-email` | No | Confirm a user email using an OTP. |
| `POST` | `/auth/verify-email-resendOtp` | No | Resend the email verification OTP. |
| `POST` | `/auth/forget-password` | No | Send a password reset OTP to the user. |
| `POST` | `/auth/forget-password-resend` | No | Resend the password reset OTP. |
| `POST` | `/auth/verify-forget-password` | No | Verify the password reset OTP. |
| `POST` | `/auth/signup/gmail` | No | Sign up or log in with a Google ID token. |

### User routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/user` | Yes | Return the authenticated user profile. |
| `POST` | `/user/upload-profile-pic` | Yes | Create a pre-signed upload URL for the current user's profile image. |
| `POST` | `/user/upload-profile-pic` | Yes | User controller also includes a cover image upload flow under the same route name. |
| `POST` | `/user/logout` | Yes | Invalidate a session token or remove a token from the blacklist. |

### Catalog routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/category` | No | Create a category with optional image upload. |
| `GET` | `/category` | No | List categories with optional filter query parameters. |
| `GET` | `/category/:id` | No | Fetch a category by ID. |
| `PATCH` | `/category/:id` | No | Update category details and image. |
| `DELETE` | `/category/:id` | No | Delete a category and remove associated S3 asset if present. |
| `POST` | `/subcategory` | No | Create a subcategory with optional image upload. |
| `GET` | `/subcategory` | No | List subcategories. |
| `GET` | `/subcategory/:id` | No | Fetch a subcategory by ID. |
| `PATCH` | `/subcategory/:id` | No | Update a subcategory. |
| `DELETE` | `/subcategory/:id` | No | Delete a subcategory. |
| `POST` | `/brand` | No | Create a brand with logo upload. |
| `GET` | `/brand` | No | List brands. |
| `GET` | `/brand/:id` | No | Fetch a brand by ID. |
| `PATCH` | `/brand/:id` | No | Update a brand and logo. |
| `DELETE` | `/brand/:id` | No | Delete a brand. |
| `POST` | `/product` | Admin | Create a product and upload product gallery files. |
| `PATCH` | `/product/:id` | Admin | Update a product, image gallery, or discount fields. |
| `GET` | `/product/all` | No | List products with category, brand, subcategory, and price filters. |
| `GET` | `/product/:productId` | No | Fetch a product by ID with populated references. |

### Cart, wishlist, address, and coupon routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/cart` | Yes | Add a product to the authenticated user's cart. |
| `GET` | `/cart/:cartId` | Yes | Retrieve a cart by cart ID for the current user. |
| `PATCH` | `/cart/:cartId` | Yes | Update cart contents. |
| `DELETE` | `/cart/:cartId/product/:productId` | Yes | Remove a product from the cart. |
| `DELETE` | `/cart/:cartId` | Yes | Clear the cart. |
| `POST` | `/wishlist` | Yes | Add a product to the user's wishlist. |
| `GET` | `/wishlist` | Yes | Get the user's wishlist. |
| `DELETE` | `/wishlist` | Yes | Remove a product from the wishlist. |
| `POST` | `/address` | Yes | Create a new address. |
| `GET` | `/address/all` | Yes | List user addresses. |
| `GET` | `/address/default` | Yes | Get the default address for the user. |
| `PATCH` | `/address/:addressId` | Yes | Update an address. |
| `DELETE` | `/address/:addressId/delete` | Yes | Delete an address. |
| `POST` | `/coupon` | Yes | Create a coupon. |
| `GET` | `/coupon` | Admin | List coupons. |
| `PATCH` | `/coupon/:couponId` | Yes | Update a coupon. |
| `DELETE` | `/coupon/:couponId` | Yes | Soft-delete a coupon. |
| `PATCH` | `/coupon/:couponId/apply/:cartId` | Yes | Apply a coupon to a cart. |
| `DELETE` | `/coupon/remove/:cartId` | Yes | Remove a coupon from a cart. |

### Order routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/order/cash` | Yes | Create a cash-order from the user's cart. |
| `POST` | `/order/card` | Yes | Create a Stripe checkout session for a card order. |
| `GET` | `/order` | Admin | Fetch all orders. |
| `GET` | `/order/:orderId` | Yes | Fetch an individual order by ID for the current user. |
| `PATCH` | `/order/:orderId` | Yes | Update an order. |
| `DELETE` | `/order/:orderId` | Yes | Soft-delete an order. |
| `POST` | `/order/paid` | No | Payment confirmation endpoint used by card payment callbacks. |
| `POST` | `/order/:orderId/refund` | Yes | Trigger a Stripe refund for a paid order. |

### S3 access routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/app/uploads/*path` | No | Stream an object from the configured S3 bucket. |
| `GET` | `/app/pre-signed-upload/*path` | No | Generate a pre-signed URL for S3 resource access. |

---

## 🔐 Authentication and Authorization

Authentication is implemented through custom NestJS guards and JWT verification.

- `src/common/decorator/auth.decorator.ts` defines the `Auth` decorator.
- `AuthenticationGuard` extracts the bearer token from the `Authorization` header, validates it, and loads the user and token payload into the request.
- `TokenService.checkToken()` validates the token against the expected type (`Access` or `Refresh`) and checks the user role secret signature.
- A Redis blacklist key is checked to prevent previously logged-out tokens from being reused.
- `AuthorizationGuard` enforces allowed roles using `RoleEnum` and the `Roles` metadata.

The auth flow uses:

- `RoleEnum.User` and `RoleEnum.Admin`
- `TokenEnum.Access` and `TokenEnum.Refresh`
- access tokens expiring after 15 minutes and refresh tokens expiring after one year

User passwords are hashed with `bcrypt`. Sensitive phone numbers are encrypted/decrypted with `crypto-js` using `ENCRYPTION_KEY`.

---

## 🗄️ Database and Data Models

MongoDB is the persistence layer for the app. Models live under `src/Models` and are registered using `@nestjs/mongoose`.

### Core entities

- `User`: user profile, email, password, provider (`System` / `Google`), role, phone, profile images, and verification state
- `Category`: catalog category with name, slug, image, and active flag
- `SubCategory`: category child entity with linked `categoryId`
- `Brand`: brand entity with name, slug, logo, active flag
- `Product`: product with name, slug, category, subcategory, price, discount, gallery, stock, and rating metadata
- `Cart`: user cart with product line items, coupon reference, total price, and discounted total
- `Wishlist`: user wishlist keyed by `userId` and a list of products
- `Address`: user delivery address with alias, type, street/city/country info, and default flag
- `Coupon`: discount code with activation/deactivation window and discount details
- `Order`: checkout record with cart linkage, address, payment state, delivery status, and Stripe payment intent tracking

Relationships are primarily reference-based via MongoDB ObjectIds.

---

## ✅ Validation and Error Handling

Validation is handled through:

- DTO validation decorators (`class-validator`)
- global `ValidationPipe` configured in `src/main.ts` with `transform: true`
- custom `IsMatch` validator for password confirmation fields
- custom file validation helpers for upload restrictions

The project throws standard NestJS exceptions such as:

- `BadRequestException`
- `ConflictException`
- `NotFoundException`
- `UnauthorizedException`
- `ForbiddenException`

A global exception filter is not present in the codebase; errors are returned via Nest's default exception pipeline and the application-level `ResponseInterceptor` wraps successful payloads as `{ message: 'done', data }`.

---

## 🔌 External Services and Integrations

### AWS S3

The `S3BucketService` supports:

- generating signed upload URLs
- uploading files and multiple files
- downloading objects and generating signed download URLs
- deleting single or multiple files
- listing object keys in a folder

This is used for profile pictures, cover photography, category/brand images, and product gallery assets.

### Redis

The `RedisService` manages:

- OTP keys and request counters
- blocked OTP windows
- token blacklist entries
- optional FCM and Socket.IO-related keys

### Email

`EmailService` sends verification and reset emails using `nodemailer` and Gmail SMTP credentials from environment variables.

### Stripe

The `StripeService` provides:

- `createCheckoutSession()` for card-based order checkout
- `createCoupon()` for temporary coupon generation in Stripe
- `createRefund()` for refund actions

### Google OAuth

The auth flow validates Google ID tokens using `google-auth-library` and creates or signs in a user based on the verified email.

---

## 🛠️ Development Notes

A few implementation details are worth noting for developers joining the project:

- The app currently uses `MongooseModule.forRootAsync` and reads `DB_URI_LOCAL` from the environment.
- `ConfigModule.forRoot` looks for `.env.dev` and `.env.prod` files.
- `SharedModule` is marked global and provides shared database, Redis, JWT, token, and security services.
- The project uses custom repository abstractions around Mongoose models in `src/Repo`.
- Several endpoints and service methods are functional but not fully standardized; naming consistency and route duplication are areas for cleanup.
- `ResponseInterceptor` wraps all successful responses in a consistent structure, but individual controllers still return their own message objects.

---

## 🧪 Testing

Jest is configured for the project.

```bash
npm run test
```

For coverage:

```bash
npm run test:cov
```

There is not yet a comprehensive test suite covering the application.

---

## 🚀 Build and Deployment

The project is set up as a backend service intended to run as a Node.js/NestJS process. It includes standard NestJS build scripts, but deployment configuration is not included.

### Production build

```bash
npm run build
npm run start:prod
```

The application is intended to be deployed with environment variables configured for MongoDB, Redis, S3, SMTP, Google OAuth, and Stripe.

---

## 🌱 Future Improvements

Reasonable next steps for this codebase include:

- adding a proper Swagger/OpenAPI setup for API documentation
- standardizing route naming and removing duplicate/legacy endpoints
- adding a real automated test suite for auth, catalog, cart, and order flows
- improving admin authorization and audit logging around sensitive actions
- consolidating repository/service patterns for maintainability
- adding explicit validation around coupon and order edge cases

---

## 👤 Author

**Yousif Amr**

## 📄 License

UNLICENSED

---

## Summary

This application is a MongoDB-backed e-commerce API built with NestJS, designed for product catalog management, secure user authentication, cart and order processing, coupon handling, media uploads, and Stripe-based payments. It is a working backend service with operational integrations for Redis, SMTP, Google login, and AWS S3, and it remains a solid foundation for a commerce platform with some route and validation patterns that could be standardized further.