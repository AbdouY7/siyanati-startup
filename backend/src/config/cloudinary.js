require("dotenv").config();
const cloudinary = require("cloudinary").v2;

if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  console.error("WARNING: Cloudinary environment variables are missing!");
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME?.trim(),
  api_key: process.env.API_KEY?.trim(),
  api_secret: process.env.API_SECRET?.trim(),
});

module.exports = cloudinary;
