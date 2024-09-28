import { DomainModel, PageModel } from "../database";
import { DomainDocument, DomainInput, DomainUpdateInput, PageEditInput, ParsedPageObject, UserDocument } from "../types";
import { validateDmainInput } from "../utils";
import configData from "../config/data";

export default class Domain {
    private document : DomainDocument;

    constructor(domainDocument: DomainDocument) {
        this.document = domainDocument;
    }

    public async edit(data: { theme: PageEditInput["domain"]["theme"] }) : Promise<Domain> {
        await DomainModel.updateOne({ _id: this.document.id }, data);

        return this;
    }

    public async populate() : Promise<Domain> {
        await this.document.populate({
            path: "created_by updated_by",
            select: "name"
        })

        return this;
    }

    public async update(domainInput: DomainUpdateInput["domain"], user: UserDocument) : Promise<Domain | null> {
        await this.document.updateOne({
            ...domainInput,
            updated_at: new Date(),
            updated_by: user._id
        });

        this.document = await DomainModel.findById(this.document._id);

        return this;
    }

    public async publish(user: UserDocument) {
        return await this.update({
            published: !this.json.published
        }, user);
    }

    public async revalidateAllPages() {
        const links = await PageModel.aggregate([
            {
              $unwind: {
                path: "$locales",
              },
            },
            {
              $project: {
                link: 1,
                locale: "$locales.locale",
              },
            },
        ]);

        configData.revalidates.addMany(links);
    }

    static async id(id: string) : Promise<Domain> {
        const document = await DomainModel.findById(id);

        return new Domain(document);
    }

    static async create(domainInput: DomainInput, user: UserDocument) : Promise<Domain | null> {
        const domain = new DomainModel({
            ...domainInput,
            created_by: user._id
        });

        return new Domain(await domain.save());
    }
    
    static async all() {
        const res = await DomainModel.find({});

        return res;
    }

    public get json() {
        return this.document.toJSON();
    }
}