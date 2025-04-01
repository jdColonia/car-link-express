# CAR LINK API

# Authors

> - Alejandro Londoño Bermúdez - A00395978
> - Juan David Colonia Aldana - A00395956
> - Miguel Ángel Gonzalez Arango - A00395687


# API Documentation

The purpose of this API is to facilitate the car rental process for natural owners who wish to rent out their vehicles. It provides endpoints for managing vehicles, rentals, and user roles within the system. The API supports three user roles: Administrator, Tenant, and Owner.

Owners can register their vehicles, manage rental listings, and update vehicle information. If owners do not provide accurate vehicle details, the API can fetch vehicle information from an external service (API Ninjas).

Tenants can search for available rental vehicles, view details, and book rentals.

Administrators have full access to manage users, assign roles, and oversee the entire system's operations.

---

## 1. Authentication Routes

| **Route**                     | **Method** | **Description**                                       |
|-------------------------------|------------|-------------------------------------------------------|
| `/auth/signup`                | POST       | Registers a new user account.                         |
| `/auth/login`                 | POST       | Logs in an existing user and returns a JWT token.     |
| `/auth/test/admin`            | GET        | Tests the access for users with **ADMIN** role.       |
| `/auth/test/tenant`           | GET        | Tests the access for users with **TENANT** role.      |
| `/auth/test/owner`            | GET        | Tests the access for users with **OWNER** role.       |

---

## 2. Users Routes

| **Route**                                  | **Method** | **Description**                                                   |
|--------------------------------------------|------------|-------------------------------------------------------------------|
| `/users`                                   | GET        | Retrieves all users, only accessible by **ADMIN** role.           |
| `/users/:userId`                           | GET        | Retrieves the profile of a specific user.                         |
| `/users/:userId/addOwnerRole`              | POST       | Assigns the **OWNER** role to a user.                             |
| `/users/:userId/addAdminRole`              | POST       | Assigns the **ADMIN** role to a user.                             |
| `/users/:userId`                           | PUT        | Edits the information of a specific user.                         |
| `/users/:userId`                           | DELETE     | Deletes a specific user.                                          |
| `/users`                                   | POST       | Creates a new user, accessible only by **ADMIN** role.            |

---

## 3. Vehicles Routes

| **Route**                                  | **Method** | **Description**                                                   |
|--------------------------------------------|------------|-------------------------------------------------------------------|
| `/vehicles`                                | POST       | Creates a new vehicle, accessible only by **OWNER** role.         |
| `/vehicles`                                | GET        | Retrieves all vehicles.                                           |
| `/vehicles/myVehicles`                     | GET        | Retrieves the vehicles owned by the authenticated **OWNER**.      |
| `/vehicles/:id`                            | GET        | Retrieves a specific vehicle by its ID.                           |
| `/vehicles/license/:licensePlate`         | GET        | Retrieves a vehicle by its license plate.                         |
| `/vehicles/:id`                            | PUT        | Updates the information of a specific vehicle.                    |
| `/vehicles/:id`                            | DELETE     | Deletes a specific vehicle.                                       |

---

## 4. Rentals Routes

| **Route**                                  | **Method** | **Description**                                                   |
|--------------------------------------------|------------|-------------------------------------------------------------------|
| `/rentals`                                 | POST       | Creates a new rental.                                             |
| `/rentals`                                 | GET        | Retrieves all rentals.                                            |
| `/rentals/:id`                             | GET        | Retrieves a specific rental by its ID.                            |
| `/rentals/:id`                             | PUT        | Updates the information of a specific rental.                     |
| `/rentals/:id`                             | DELETE     | Deletes a specific rental.                                        |


# How to Use the RESTful API

## 1. Install Dependencies

Run the following command to install required dependencies:

```bash
npm install
```
## 2. Configure MongoDB URI

Rename .env.template to .env:

```bash
mv .env.template .env
```

Replace the placeholder MONGODB_URI in the .env file with your actual MongoDB connection string:

## 3. Run the Application in Development Mode

Start the server in development mode:

```bash
npm run dev
```
## 4. Run Tests with Coverage
To run tests and check coverage:

```bash
npm run test:coverage
```

# Conclusion and Next Steps

## Conclusion

This RESTful API handles car rental management with three roles: **Admin**, **Tenant**, and **Owner**. It integrates with external APIs (like Ninjas API) for vehicle data, and uses **MongoDB** with **Mongoose** for data management. The app manages user authentication, role-based access, and car rental operations.

## Challenges

### Testing with Jest
Testing has been complex due to the need to mock MongoDB models and async operations. Proper role-based access tests also require careful handling of authentication and middleware.

### Mongoose and MongoDB Models
Mongoose's flexibility can lead to challenges in data consistency and schema management.

## Next Steps

1. **Improve Testing Coverage**: Enhance tests, especially for edge cases and role-based actions.
2. **Refactor MongoDB Operations**: Create utility functions for common database operations.
3. **Implement CI/CD Pipeline**: Automate testing and deployment.
