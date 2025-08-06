const { errorResponse, successResponse } = require("../../../utils/response");
const { User, AccessUser } = require("../../../models/index");
const {
  createAccessToken,
  createRefreshToken,
  decodeToken,
} = require("../../../utils/jwt");
const sendMail = require("../../../utils/mail");
const otpGenerator = require("otp-generator");

module.exports = {
  verifyAccount: async (req, res) => {
    try {
      const { data } = req.body;
      const { email } = data;
      const userAgent = req.useragent;
      const userAgentInfo = userAgent.browser;
      console.log("userAgentInfo: ", userAgentInfo);
      const user = await User.findOne({ where: { email } });

      const accessUser = await AccessUser.findOne({
        where: {
          user_id: user.id,
          device_name: userAgentInfo,
        },
      });
      console.log("accessUser: ", accessUser);
      console.log("accessUserOTP: ", accessUser.otp);

      const accessToken = createAccessToken({ userId: user.id });
      const refreshToken = createRefreshToken();

      const { box_1, box_2, box_3, box_4 } = data;
      console.log(box_1, box_2, box_3, box_4);

      if (!box_1 || !box_2 || !box_3 || !box_4) {
        return errorResponse(res, 400, "Vui lòng nhập đầy đủ mã OTP");
      }
      const otpClient = `${box_1}${box_2}${box_3}${box_4}`;
      console.log("otpClient: ", otpClient);
      if (otpClient !== accessUser.otp) {
        return errorResponse(res, 400, "Mã OTP không chính xác");
      }
      const expiredOTP = new Date(accessUser.expired_otp);
      const now = new Date();
      if (now.getTime() - expiredOTP.getTime() > 60 * 1000) {
        return errorResponse(res, 400, "Mã OTP đã hết hạn");
      }

      await AccessUser.update(
        { status: true, refresh_token: refreshToken },
        { where: { user_id: user.id, device_name: userAgentInfo } }
      );
      return successResponse(res, 200, "Xác minh tài khoản thành công", {
        accessToken,
        refreshToken,
      });
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;
      const userAgent = req.useragent;
      const userAgentInfo = userAgent.browser;
      const user = await User.findOne({ where: { email } });

      const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      await sendMail(
        email,
        "Xác minh tài khoản",
        `<h1>Mã xác minh là: ${otp}</h1>`
      );

      await AccessUser.update(
        {
          otp: otp,
          expired_otp: new Date(),
        },
        {
          where: {
            user_id: user.id,
            device_name: userAgentInfo,
          },
        }
      );
      return successResponse(res, 200, "Đã gửi lại mã OTP");
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
  getExpiresToken: async (req, res) => {
    try {
      const { access_token: accessToken, refresh_token: refreshToken } =
        req.body;
      console.log(accessToken);
      const decodedAccess = decodeToken(accessToken);
      const decodedRefresh = decodeToken(refreshToken);
      if (!decodedAccess || !decodedRefresh) {
        return errorResponse(res, 400, "Token không hợp lệ");
      }
      const expAccess = decodedAccess.exp;
      const expRefresh = decodedRefresh.exp;
      return successResponse(res, 200, "Thời gian hết hạn của token", {
        expAccess,
        expRefresh,
      });
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
};
