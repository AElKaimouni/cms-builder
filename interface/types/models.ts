import { PageDocument } from "../builder/types";
import { MediaProps } from "../elements";


interface LocalizedModel {
    page: PageDocument;
}

export interface BlogModel extends LocalizedModel {
    _id: string;
    title: string;
    image: MediaProps["media"];
    tags: string;
    created_at: Date;
    author: string;
}

export interface CommentModel {
    name: string;
    image: MediaProps["media"];
    description: string;
    created_at: Date;
}