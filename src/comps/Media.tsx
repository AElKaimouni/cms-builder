import { Media, MediaImage } from "../types/media";
import { AdvancedImage } from '@cloudinary/react';
import { fit } from "@cloudinary/url-gen/actions/resize";
import { Cloudinary } from "@cloudinary/url-gen";
import { PagesIcon } from "../utils";
import config from "../config";

interface Props extends Omit<React.ComponentProps<typeof AdvancedImage>, "cldImg"> {
    media: Media;
}

const cld = new Cloudinary({
    cloud: {
      cloudName: config.CLOUD_NAME
    }
});

export default ({ media, height, width, ...props } : Props) => {
    if (media.type === "video") {
        return <video src={media.url} controls autoPlay />
    } else {
        const myImage = cld.image(media.public_id); 
        myImage.resize(fit(width, height));
    
        if(media.public_id && media.type === "image") return (
            <AdvancedImage {...props} cldImg={myImage} />
        );
        else {
            if(media.type && media.type.indexOf("image") === 0) return <img src={media.url} {...props} />;
            else return <PagesIcon />
        }
    }
    
}