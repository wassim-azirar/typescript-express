import { Request, Response } from "express";
import { Client } from "../externals/petstore.api";

export const GetById = (request: Request, response: Response) => {
  const client = new Client();
  const petId = +request.params.id; // convert string to number
  client.getPetById(petId).then((pet) => {
    response.send(pet);
  });
};
