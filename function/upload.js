const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnozdwexv",
  api_key: "658661343353841",
  api_secret: "M9S7fNIW-O1T0jL1qDQB9OkMQrQ",
});

exports.uploadFile = (bufferImage) => {
  const imageBuffer = Buffer.from(bufferImage);
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      })
      .end(imageBuffer);
  });
};
