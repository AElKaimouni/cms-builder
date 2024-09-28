import { Cloudinary } from "@cloudinary/url-gen";
import { BuilderMedia } from "../../builder/types";
import { fit } from "@cloudinary/url-gen/actions/resize";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.cloudname || "elkommerce"
  }
});

export default (media: BuilderMedia, width?: number, height?: number) : string => {
    const myImage = cld.image(media.public_id); 

    if(width && !height) height = width * (media.height / media.width);
    if(!width && height) width = height * (media.width / media.height);

    myImage.resize(fit(Math.ceil(Math.min(width || media.width, media.width)), Math.ceil(Math.min(height || media.height, media.height))));
    return myImage.toURL()
}