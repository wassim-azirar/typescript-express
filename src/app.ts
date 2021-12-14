import { Request, Response } from "express";
import APIServer from "./APIServer";

const server = new APIServer();

const route = (method: string, path: string) => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    server.app[method](path, (request: Request, response: Response) => {
      response.status(200).json(descriptor.value(request, response));
    });
  };
};

const authorize = () => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = (...args: unknown[]) => {
      const req = args[0] as Request;
      const res = args[1] as Response;
      const headers = req.headers;
      if (headers.hasOwnProperty("apikey") && headers.apikey == process.env.API_KEY) {
        return original.apply(this, args);
      }
      res.status(403).json({ error: "Not Authorized" });
    };
  };
};

export default class APIRoutes {
  @route("get", "/")
  @authorize()
  public indexRoute(request: Request, response: Response) {
    return "Hello world";
  }
}

server.start();
