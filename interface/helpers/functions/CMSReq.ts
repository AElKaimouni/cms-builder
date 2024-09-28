import axios from "axios"

const CMS_HOST = process.env.CMS_HOST;

const CSMReq = async (req: string, locale: string) => {
    const localeParam = `?_locale=${locale}`;

    try {
        return (await axios.get(`${CMS_HOST}/${req}${localeParam}`)).data;

    } catch {
        try {
            return (await axios.get(`${CMS_HOST}/${req}?_locale=fr`)).data;

        } catch {
            console.log(`CMS ERROR : ${CMS_HOST}/${req}?_locale=fr`);

            return null;
        }
    }
}

export default CSMReq;