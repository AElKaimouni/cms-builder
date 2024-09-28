import config from "./config";
import next from "next";
import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes";
import { nextMiddleware } from "./middlewares";

const app = next({ dev: config.dev && config.nextDev, conf: config.next, dir: path.join(__dirname, "interface"), hostname: "localhost", port: 2002 });
const server = express();

server.use(express.json({ limit: 5 * 1000 * 1000 }));
server.use(express.urlencoded({ extended: true }));
server.use(cors());


export default async () => {
    server.use("/cms", routes);
    if(!config.build) {
        const nextHandler = app.getRequestHandler(); 

        try { 
            await app.prepare();
        } catch(error) {
            console.error("Cannot prepare next app with error : \n", error);
        } finally {
            server.use("/admin", express.static("build"));

            server.get("/admin/*", (req, res) => {
                res.sendFile(path.join(__dirname, "build", "index.html"));
            });

            server.get('/cv', (req, res) => {
                const filePath = path.join(__dirname, 'interface/public/cv.pdf');
              
                // Send the file as an attachment
                res.download(filePath, "el-kaimouni-abderrahmane-cv.pdf", (err) => {
                  if (err) {
                    // Handle error, such as file not found
                    res.status(404).send('File not found');
                  }
                });
              });
        
            server.all("*", nextMiddleware, (req, res) => nextHandler(req, res))
        }
    } else {
        server.post("/end", (req, res) => {
            res.sendStatus(200);
            listener.close();
            return process.exit(0);
        })
    }

    var listener = server.listen(config.env.PORT, () => console.log(`server is listening on http://localhost:${config.env.PORT}`));

    return;

}