const { errorResponse } = require("../../utils/response");
const { User, BlackList } = require("../../models/index");
const { decodeToken } = require("../../utils/jwt");

module.exports = async (req, res, next) => {
  try {
    // Lấy accessToken từ header
    const authorizationStr = req.headers.authorization;
    if (!authorizationStr || !authorizationStr.startsWith("Bearer")) {
      // console.log("Dòng số 10");
      return errorResponse(res, 401, "Unauthorized");
    }

    const accessToken = authorizationStr?.split(" ")[1];
    if (!accessToken) {
      // console.log("Dòng số 16");
      return errorResponse(res, 401, "Unauthorized");
    }

    try {
      //Verify accessToken
      const decoded = decodeToken(accessToken);
      console.log("decoded: ", decoded);
      if (!decoded || !decoded.userId) {
        // console.log("Dòng số 24");
        return errorResponse(res, 401, "Unauthorized");
      }

      if (accessToken) {
        const blacklist = await BlackList.findOne({
          where: {
            token: accessToken,
          },
        });
        if (blacklist) {
          return errorResponse(res, 401, "Token đã bị vô hiệu hóa");
        }
      }

      // Kiểm tra có tồn tại user với id đã decode không
      const checkExist = await User.findByPk(decoded.userId);
      if (!checkExist) {
        // console.log("Dòng số 42");
        return errorResponse(res, 401, "Unauthorized");
      }
      //Lưu id user vào req
      req.user = {
        userId: decoded.userId,
      };
      next();
    } catch (e) {
      console.log(e);
      // console.log("Dòng số 50");
      return errorResponse(res, 401, e.message);
    }
  } catch (e) {
    console.log(e);
    // console.log("Dòng số 56");
    return errorResponse(res, 401, e.message);
  }
};
