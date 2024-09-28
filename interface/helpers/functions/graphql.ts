import axios from "axios";

const graphql = async (query: string) => {
    return (await axios.post(`${process.env.CMS_HOST}/graphql`, { query })).data.data;
}

export default graphql;