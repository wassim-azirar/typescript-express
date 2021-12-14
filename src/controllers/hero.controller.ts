import axios from "axios";
import { Request, Response } from "express";

export const GetAll = (request: Request, response: Response) => {
  axios.get("http://localhost:3001/heroes").then((res) => {
    response.send(res.data);
  });
};

export const GetByEmail = async (email: string) => {
  const response = await axios.get(`http://localhost:3001/heroes/${email}`);
  return response.data;
};
