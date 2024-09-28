import LocalesData from "../../classes/ConfigData/Locales.cd";
import RevalidatesData from "../../classes/ConfigData/Revalidates.cd";

export default {
    locales: new LocalesData("./config/data/locales.config.json"),
    revalidates: new RevalidatesData("./config/data/revalidates.config.json")
}