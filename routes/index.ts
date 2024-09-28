import Express from "express";
import mediaRoute from "./media";
import configRoute from "./config";
import userRoute from "./user";
import pageRoute from "./page";
import domainRoute from "./domain";
import symbolRoute from "./symbol";
import modelRoute from "./model";



const routes = Express.Router();

routes.use("/config", configRoute);
routes.use("/media", mediaRoute);
routes.use("/user", userRoute);
routes.use("/page", pageRoute);
routes.use("/domain", domainRoute);
routes.use("/symbol", symbolRoute);
routes.use("/model", modelRoute);



export default routes;
