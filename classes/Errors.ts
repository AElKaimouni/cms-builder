export enum ServerErrors {
    MODEL_IS_NOT_EXIST,
    UNVALID_QUERY_OBJECT,
    UNKNWON_REF_TARGET,
    UNDEFINED_LOCALE,
    UNVALID_REF
}

export class ServerError extends Error {
    public type : ServerErrors;

    constructor(message: string, type: ServerErrors) {
        super(message);
        
        this.type = type;
    }
}