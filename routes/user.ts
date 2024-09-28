import express, { Request, Response} from "express";
import { UserModel } from "../database";
import { User, UserDeleteInput, UserDocument, UserEditData, UserFindInput, UserInput, UserRole, UserUpdateInput } from "../types/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth, authToken, authUser } from "../middlewares";
import mongoose, { Mongoose, MongooseError } from "mongoose";
import config from "../config";
import { parseQuery, projectUser, validateUserCreateInput, validateUserDeleteInput, validateUserFindInput, validateUserLoginInput, validateUserTableInput, validateUserUpdateInput } from "../utils";
import { MongoError, MongoServerError } from "mongodb";
import { FieldTypes, ModelPropsObject } from "../types";


const userRoute = express.Router();
const nameRegExp = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/;
const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

const userProps : ModelPropsObject = {
    avatar: { 
        __type: FieldTypes.Model,
        __args: {
            model: "media"
        }
    }
};

const validateRegisterInfo = (user: UserInput) : boolean => {
    if(!user.name || !user.name.match(nameRegExp)) return false;
    if(!user.email || !user.email.match(emailRegExp)) return false;
    if(!user.password || !user.password.match(passRegExp)) return false;

    return true;
}

const compareUser = (user: UserDocument, input: UserFindInput | UserDeleteInput["users"][0] | UserUpdateInput["user"]) => {
    return user.name === input.name ||
        user.email === input.email ||
        user._id.toString() === input._id;
}

userRoute.get("/auth/:token", async (req: Request, res: Response) => {
    const { token } = req.params;

    if(token && typeof token === "string") {
        const user = await authToken(token);
        return res.status(200).json(user ? user.toJSON() : null)
    } else return res.sendStatus(400);
})

userRoute.post("/register", async (req: Request, res: Response) => {
    const regInfo : UserInput = req.body;
    if(!validateRegisterInfo(regInfo)) return res.status(400).send("Invalid register info.");

    const nameResult = await UserModel.findOne({ name : regInfo.name });
    if(nameResult) return res.status(400).json({
        field: "username",
        error: "Username allready taken."
    });

    const emailResult = await UserModel.findOne({ email : regInfo.email });
    if(emailResult) return res.status(400).json({
        field: "emial",
        error: "Email allready registred."
    });

    try {
        const hashedPass = await bcrypt.hash(regInfo.password, 10);
        const usersCount = await UserModel.count();
        if(usersCount === 0) {
            const user = new UserModel({ name: regInfo.name, email: regInfo.email , password : hashedPass, role: 0 });
            await user.save();

            const token = jwt.sign({ id: user.id }, config.env.AUTH_SECERT, { expiresIn: "8h" });

            return res.status(200).json({ token });
        } else {
            const user = new UserModel({ name: regInfo.name, email: regInfo.email , password : hashedPass });
            await user.save();
    
            return res.sendStatus(200);
        }

    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }
})

userRoute.post("/login", async (req: Request, res: Response) => {
    try {
        const input = validateUserLoginInput(req.body);

        if(!input) return res.sendStatus(400);
    
        const user = await UserModel.findOne({ name: input.name });
    
        if(!user) return res.sendStatus(400);
    
        if(user.role > UserRole.Admin) return res.sendStatus(403);
        
        if(!await bcrypt.compare(input.password, user.password)) return res.sendStatus(400);
    
        const token = jwt.sign({ id: user.id }, config.env.AUTH_SECERT, { expiresIn: input.remeber ? "168h" : "8h" });

        await user.populate("avatar");
    
        return res.status(200).json({ token, user: projectUser(user.toJSON()) });
    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

userRoute.post("/delete", auth(UserRole.Admin, (perms, req) => {
    if(perms.models.users?.[3]) return true;
    const input = req.input = validateUserDeleteInput(req.body);

    if(!input || input.users.length !== 1) return false;

    const user = input.users[0];

    return compareUser(req.user, user);
}), async (req: (Request & { user?: UserDocument, input?: UserDeleteInput }), res: Response) => {
    try {
        const input = req.input || validateUserDeleteInput(req.body);

        if(!input) return res.sendStatus(400);

        const names = [], ids = [], emails = [];

        input.users.forEach(user => {
            if(user._id) return ids.push(user._id);
            if(user.email) return emails.push(user.email);
            if(user.name) return names.push(user.name);
        });

        const result = await UserModel.deleteMany({ $and: [
            { $or: [
                { role: { $gt: req.user?.role || -1 } },
                ...(req.user ? [
                    { _id: req.user._id }
                ] : [])
            ] },
            { $or: [
                { name: { $in: names } },
                { _id: { $in: ids } },
                { email: { $in: emails } }
            ] }
        ] });

        return res.status(200).json(result.deletedCount)
    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }
})

userRoute.post("/create", auth(UserRole.Admin, perms => perms.models.users?.[0]), async (req: Request & { user?: UserDocument }, res: Response) => {
    try {
        const input = validateUserCreateInput(req.body);

        if(!input) return res.sendStatus(400);

        if(req.user && input.role <= req.user.role) return res.sendStatus(403);

        input.password = await bcrypt.hash(input.password, 10);
        
        const user = new UserModel({ ...input, role: Math.min(input.role, UserRole.User) });

        const document = await user.save();

        return res.status(200).json(projectUser(document.toJSON()));
    } catch(error) {
        if(error.name === "MongoServerError" && error.code === 11000) {
            return res.status(400).send(`field "${Object.keys(error.keyValue)[0]}" wich is "${Object.values(error.keyValue)[0]}" is not unqiue`);
        }

        console.error(error);
        return res.sendStatus(500);
    }

});

userRoute.post("/update", auth(UserRole.Admin, (perms, req) => {
    if(perms.models.users?.[2]) return true;
    const input = req.input = validateUserUpdateInput(req.body);

    if(!input) return false;

    return compareUser(req.user, input.user);
}), async (req: (Request & { user: UserDocument, input?: UserUpdateInput }), res: Response) => {
    try {
        const input = req.input || validateUserUpdateInput(req.body);

        if(!input) return res.sendStatus(400);

        if(input.data.perms && req.user.role > UserRole.Super_Admin) return res.sendStatus(403);
        if(typeof input.data.role === "number" && req.user && req.user.role >= input.data.role) return res.sendStatus(403);
        if(input.data.password) input.data.password = await bcrypt.hash(input.data.password, 10);

        const result = await UserModel.updateOne({
            $or: [
                {
                    ...input.user,
                    role: { $gt: req.user.role }
                },
                ...(req.user ? [
                    {
                        ...input.user,
                        _id: req.user?._id
                    }
                ] : [])
            ]
        }, {
            ...input.data,
            role: typeof input.data.role === "number" ? Math.min(input.data.role, UserRole.User) : undefined
        });

        if(result.matchedCount) return res.sendStatus(200);
        else return res.sendStatus(404);
    } catch(error) {
        if(error.name === "MongoServerError" && error.code === 11000) {
            return res.status(400).send(`field "${Object.keys(error.keyValue)[0]}" wich is "${Object.values(error.keyValue)[0]}" is not unqiue`);
        }

        console.error(error);
        return res.sendStatus(500);
    }
});

userRoute.post("/", auth(UserRole.Admin, (perms, req) => {
    if(perms?.models.users?.[1]) return true;
    const input = req.input = validateUserFindInput(req.body);

    if(!input) return false;

    return compareUser(req.user, input);
}), async (req: Request & { user?: UserDocument, input?: UserFindInput }, res: Response) => {
    try {
        const input = req.input || validateUserFindInput(req.body);
        
        if(!input) return res.sendStatus(400);

        const [projector, populate] = input.query ? await parseQuery(input.query, userProps) : [{ password: 0 }, "avatar"];
        const query = {...input, $or: [
            { role: { $gt: req.user?.role || -1 } },
            ...(req.user ? [
                { _id: req.user._id }
            ] : [])
        ]};

        if(projector["password"]) delete projector["password"];
        delete query["query"];

        const user = await UserModel.findOne(query, projector).populate(populate);

        if(user) return res.status(200).json(user.toJSON());
        else return res.sendStatus(404);
    } catch(error) {
        
        console.error(error);
        return res.sendStatus(500);
    }
});

userRoute.post("/table", auth(2, perms => perms.models?.users?.[1]), async (req: Request & { user?: UserDocument }, res: Response) => {
    try {
        const input = validateUserTableInput(req.body);

        if(!input) return res.sendStatus(400);

        const [projector, populate] = input.query ? await parseQuery(input.query, userProps) : [undefined, {}];
        const filters = { role: { $gt: req.user?.role || -1 }, _id: { $ne: req.user?._id || "" } };

        if(input.search) filters["name"] = { $regex: new RegExp(`.*${input.search}.*`) }

        const users = await UserModel.find(filters, projector).skip(input.skip || 0).limit(input.max || 20).populate(populate);
        const count = await UserModel.find(filters).count();

        return res.status(200).json({ count, users });
    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

export default userRoute;