import mongoose from "mongoose";
import { MongoClient  } from "mongodb";
import config from "../config";

const DB_NAME = config.database.name;
const DB_HOST = config.database.host;

const client = new MongoClient(`${DB_HOST}/${DB_NAME}`);

const database : {
    connect: () => Promise<void>,
    connection: {
        mongoose: mongoose.Connection,
        mongo: ReturnType<MongoClient["db"]>
    }
} = {
    connect: () : Promise<void> => new Promise((success, failed) => {
        console.log(`Database : start connecting to database (${DB_HOST}/${DB_NAME})`);
        
        database.connection.mongoose.on("connected", () => {
            client.connect().then(() => {
                console.log(`Database : connecting to database has been succesfuly`);

                database.connection.mongo = client.db();
                success();
            }).catch(error => {
                console.log(`Database Error :  \n ${JSON.stringify(error)}`);
                failed(error)
            });
        })
        
        database.connection.mongoose.on("error", (error) => {
            console.log(`Database Error :  \n ${JSON.stringify(error)}`);
            failed(error)
        })
    }),
    connection: {
        mongoose: mongoose.createConnection(`${DB_HOST}/${DB_NAME}`),
        mongo: client.db()
    }

}

export default database;
