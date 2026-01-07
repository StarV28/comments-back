import { Application, Request, Response, NextFunction } from "express";

// Интерфейс для ошибки с необязательным свойством status
interface CustomError extends Error {
  status?: number;
}

const errorHandler = (app: Application): void => {
  // Middleware для обработки 404 ошибок
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err: CustomError = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  // Middleware для обработки всех ошибок
  app.use(
    (err: CustomError, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Server Error";

      // Вернуть ошибку в формате JSON
      res.status(status).json({
        success: false,
        message,
      });
    }
  );
};

export default errorHandler;
