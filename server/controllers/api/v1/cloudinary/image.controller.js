const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
}

module.exports = {
  deleteImage: async (req, res) => {
    try {
      const { public_id } = req.params;
      if (!public_id) {
        return res.status(400).json({ msg: "No image selected" });
      }
      cloudinary.uploader.destroy(public_id, async (err, result) => {
        if (err) throw err;
        return successResponse(res, 200, "Delete image successfully");
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  uploadImage: async (req, res) => {
    // try {
    //   if (!req.files || Object.keys(req.files).length === 0) {
    //     return res.status(400).json({ msg: "No file uploaded" });
    //   }
    //   const file = req.files.file;

    //   // Thêm một số kiểm tra an toàn nếu muốn (kiểu file, kích thước, v.v.)
    //   if (!file.mimetype.startsWith("image/")) {
    //     return res.status(400).json({ msg: "Please upload an image file" });
    //   }
    //   if (file.size > 1024 * 1024 * 5) {
    //     // giới hạn 5MB cho mỗi tệp
    //     return errorResponse(res, 400, "File size should be less than 5MB");
    //   }

    //   const result = await cloudinary.uploader.upload(file.tempFilePath);
    //   return successResponse(res, 200, "Upload image successfully", {
    //     public_id: result.public_id,
    //     url: result.secure_url,
    //   });
    // } catch (err) {
    //   console.log(err);
    //   return errorResponse(res, 500, err.message);
    // }
    try {
      const b64 = Buffer.from(req.file?.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      successResponse(res, 200, "Upload image successfully", {
        public_id: cldRes.public_id,
        url: cldRes.secure_url,
      });
    } catch (error) {
      console.log(error);
      errorResponse(res, 500, error.message);
    }
  },
};
