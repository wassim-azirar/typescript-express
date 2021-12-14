import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv";
import express, { Express } from "express";
import flash from "express-flash";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import * as http from "http";
import lusca from "lusca";
import morgan from "morgan";
import responseTime from "response-time";
import * as heroController from "./controllers/hero.controller";
import * as homeController from "./controllers/home.controller";
import { isAuthorized } from "./helpers/authenticationGuard";

export default class APIServer {
  private _app: Express;
  get app(): Express {
    return this._app;
  }

  private _server: http.Server;
  get server(): http.Server {
    return this._server;
  }

  constructor() {
    this._app = express();

    dotenv.config();

    // set the port
    this._app.set("port", process.env.PORT || 3000);

    // configure middlewares
    this.configureMiddlewares();

    // configure routes
    this.configureRoutes();
  }

  public configureMiddlewares(): void {
    this._app.disable("x-powered-by");

    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minutes
      max: 15, // limit each IP to 15 requests per windowMs
      message: "Too many accounts created from this IP, please try again after an 5 minutes"
    });

    this._app.use(bodyParser.json());
    this._app.use(bodyParser.urlencoded({ extended: true }));
    this._app.use(compression());
    this._app.use(cookieParser());
    this._app.use(cors());
    this._app.use(express.json());
    this._app.use(express.urlencoded({ extended: false }));
    this._app.use(flash());
    this._app.use(helmet());
    this._app.use(hpp());
    this._app.use(limiter);
    this._app.use(lusca.xframe("SAMEORIGIN"));
    this._app.use(lusca.xssProtection(true));
    this._app.use(morgan("dev"));
    this._app.use(responseTime());

    this._app.use((request, response, next) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
      );

      next();
    });
  }

  public configureRoutes(): void {
    this._app.get("/home", homeController.Index);
    this._app.get("/heroes", isAuthorized, heroController.GetAll);
    this._app.get("/heroes/:email", isAuthorized, async (request, response) => {
      const email = request.params.email;
      const hero = await heroController.GetByEmail(email);
      response.json(hero);
    });
  }

  public start(): void {
    this._server = this._app.listen(this._app.get("port"), () => {
      console.log(`API server is running at http://localhost:${this._app.get("port")}`);
    });
  }
}
