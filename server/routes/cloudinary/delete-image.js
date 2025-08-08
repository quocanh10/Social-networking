var express = require("express");

const imageController = require("../../controllers/api/v1/cloudinary/image.controller");

var router = express.Router();

router.delete("/delete-image/:public_id", imageController.deleteImage);
