import { Response } from 'express';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
    }
}

export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
    }
}

export const errorHandler = (error: any, res: Response) => {
    if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
    } else if (error instanceof ForbiddenError) {
        res.status(403).json({ message: error.message });
    } else if (error instanceof BadRequestError) {
        res.status(400).json({ message: error.message });
    } else if (error instanceof UnauthorizedError) {
        res.status(401).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
