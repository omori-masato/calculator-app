import { Request, Response, NextFunction } from 'express';
export declare function validateCalculationRequest(req: Request, res: Response, next: NextFunction): void;
export declare function errorHandler(error: Error, _req: Request, res: Response, next: NextFunction): void;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=validation.d.ts.map