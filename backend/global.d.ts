declare module "@apollo/server/express4" {
  import { ApolloServer } from "@apollo/server";
  import { Request, Response, NextFunction } from "express";

  export function expressMiddleware(
    server: ApolloServer,
    options?: {
      context?: (params: { req: Request; res: Response }) => any | Promise<any>;
    }
  ): (req: Request, res: Response, next: NextFunction) => void;
}
