import config from "../../../config";

export default async function handler(req, res) {
    // Check for secret to confirm this is a valid request
    const { url } = req.body;

    if(false && req.headers.authorization !== config.env.SERVER_SECRET) return res.sendStatus(401);
    if(!url) return res.sendStatus(400);
  
    try {
      await res.revalidate(url);
      return res.json({ revalidated: true });
    } catch (err) {
      // If there was an error, Next.js will continue
      // to show the last successfully generated page
      return res.status(500).send(err.message);
    }
}