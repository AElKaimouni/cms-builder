import { v2 as cloudinary } from 'cloudinary'
import config from '.';

cloudinary.config({
    cloud_name: config.cloudinary.cloudname, 
    api_key: config.cloudinary.cloudkey, 
    api_secret: config.cloudinary.cloudsecret,
    secure: true
});


export default cloudinary;