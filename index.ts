require('dotenv').config();
import server from "./server";
import database from "./database";
import config from "./config";
import axios, { AxiosError } from "axios";
import { clearModels, createModels } from "./utils";
import fs from "fs-extra";
import path from "path";
import { Model } from "./classes";
import { cmsAPi } from "./APIs";

const dynamicImport = new Function('specifier', 'return import("file:///" + specifier)');

(async () => {
    switch(config.action) {
        case "end" : {
            axios.post(`${config.env.SERVER_HOST}/end`).then(() => {
                process.exit(0);
            }).catch(err => {
                console.log(err);
                process.exit(0);
            });
        }; break;
        case "migrate" : {
            try {
                await database.connect();
                if(process.argv[3] === "clear") {
                    await clearModels();
                    console.log("Models are cleared successfuly")
                }

                const files = fs.readdirSync(path.join(__dirname, "models"));
                const models = new Array();

                for(const file of files) {
                    if(file.endsWith(".model.js")) {
                        try {
                            const model = (await dynamicImport(path.join(__dirname, "models", file))).default;

                            models.push(model);
                        } catch(error) {
                            throw new Error(`Your model file: '${file}' has an error : \n ${error.message}`);
                        }
                    }
                }
                
                const res = await createModels(models);

                try {
                    await cmsAPi.post("/model/reregister");
                } catch(error) {
                    if(!(error instanceof AxiosError && error.code === "ECONNREFUSED")) throw error;
                }

                if(res.errors.length) {
                    console.log(`Migration done with ${res.errors.length} errors : `)
                    res.errors.forEach(error => {
                        console.error(`error ${error.code} with model ${error.model} ${error.message ? `: \n ${error.messsage || ""}` : ""}`);
                    })
                } else {
                    console.log("Migration done successfuly")
                }
            } catch(error) {
                console.error(error);
                process.exit(0);
            }

            process.exit(0);
        }; break;
        default : {
            try {
                await database.connect();
            } catch (error) {
                throw new Error(`Cannot start server because of an error in db : \n ${error.message}`);
            }
            try {
                await Model.registerSchemas();
            } catch(error) {
                throw new Error(`Cannot register schemas with error : \n ${error.message}`);
            }
            try {
                return await server();
            } catch (error) { throw error }
        }; break;
    }
})();