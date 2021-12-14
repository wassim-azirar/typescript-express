import { Request, Response } from "express";

export const Index = (request: Request, response: Response) => {
  response.status(200).send({ message: "Hello world" });
};
