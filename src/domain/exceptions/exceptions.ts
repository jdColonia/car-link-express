import { Response } from 'express';

/**
 * Custom error class representing a "Not Found" error.
 * This error is thrown when a resource is not found.
 */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message); // Call the parent constructor with the message
        this.name = 'NotFoundError'; // Set the name of the error to 'NotFoundError'
    }
}

/**
 * Custom error class representing an "Unauthorized" error.
 * This error is thrown when the user is not authorized to access a resource.
 */
export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message); // Call the parent constructor with the message
        this.name = 'UnauthorizedError'; // Set the name of the error to 'UnauthorizedError'
    }
}

/**
 * Custom error class representing a "Forbidden" error.
 * This error is thrown when the user does not have permission to perform an action.
 */
export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message); // Call the parent constructor with the message
        this.name = 'ForbiddenError'; // Set the name of the error to 'ForbiddenError'
    }
}

/**
 * Custom error class representing a "Bad Request" error.
 * This error is thrown when the request is malformed or contains invalid data.
 */
export class BadRequestError extends Error {
    constructor(message: string) {
        super(message); // Call the parent constructor with the message
        this.name = 'BadRequestError'; // Set the name of the error to 'BadRequestError'
    }
}

/**
 * Error handler middleware for handling different types of errors.
 * This function maps specific error types to HTTP status codes and returns a JSON response.
 * 
 * @param error - The error that was thrown.
 * @param res - The Express Response object to send the HTTP response.
 */
export const errorHandler = (error: any, res: Response) => {
    if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message }); // Resource not found (404)
    } else if (error instanceof ForbiddenError) {
        res.status(403).json({ message: error.message }); // Forbidden (403)
    } else if (error instanceof BadRequestError) {
        res.status(400).json({ message: error.message }); // Bad request (400)
    } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ message: error.message }); // Unauthorized (401)
    } else {
        res.status(500).json({ message: 'Internal Server Error' }); // Generic server error (500)
    }
};