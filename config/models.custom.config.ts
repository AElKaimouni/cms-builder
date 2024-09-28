import { MediaModel, PageModel, UserModel } from "../database";


export default () => ({
    "media" : {
        model: MediaModel,
        preview: {
            input: {
                name: "name"
            }
        }
    },
    "pages": {
        model: PageModel
    },
})