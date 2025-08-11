const { User, AccessUser, BlackList } = require("../../../models/index");
const bcrypt = require("bcrypt");
const {
  createAccessToken,
  createRefreshToken,
  decodeToken,
} = require("../../../utils/jwt");

const { errorResponse, successResponse } = require("../../../utils/response");
const emailRegex = require("../../../utils/match_email");
const { Op } = require("sequelize");
const sendMail = require("../../../utils/mail");
const otpGenerator = require("otp-generator");
const generator = require("generate-password");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (req, res) => {
    try {
      const userAgent = req.useragent;
      const userAgentInfo = userAgent.browser;
      const { email, fullname, username, password } = req.body;
      if (!email || !fullname || !username || !password) {
        return errorResponse(res, 400, "Vui lòng nhập đầy đủ thông tin");
      }
      if (password.trim().length < 8) {
        return errorResponse(res, 400, "Mật khẩu phải có ít nhất 8 ký tự");
      }

      if (!emailRegex(email)) {
        return errorResponse(res, 400, "Email không hợp lệ");
      }
      // console.log(email);

      const user = await User.findOne({ where: { email } });
      if (user) {
        return errorResponse(res, 400, "Tài khoản đã tồn tại");
      }
      const saltRounds = 10;
      const hashPassword = bcrypt.hashSync(password, saltRounds);
      const createUser = await User.create({
        email,
        fullname,
        username,
        password: hashPassword,
      });
      await AccessUser.create({
        user_id: createUser.id,
        device_name: userAgentInfo,
      });
      return successResponse(res, 201, "Đăng ký tài khoản thành công");
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  login: async (req, res) => {
    try {
      const userAgent = req.useragent;
      const userAgentInfo = userAgent.browser;
      const { email, password } = req.body;

      // console.log(typeof userAgentInfo);
      if (!email || !password) {
        return errorResponse(res, 400, "Vui lòng nhập đầy đủ thông tin");
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse(res, 400, "Tài khoản không tồn tại");
      }
      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword) {
        return errorResponse(
          res,
          400,
          "Tài khoản hoặc mật khẩu không chính xác"
        );
      }
      if (user.is_blocked) {
        return errorResponse(res, 400, "Tài khoản đã bị khóa");
      }
      // console.log(user);
      const accessToken = createAccessToken({ userId: user.id });
      const refreshToken = createRefreshToken();

      // User đăng ký mà chưa đăng nhập lần nào, token vẫn null
      const accessUserToRegister = await AccessUser.findOne({
        where: {
          user_id: user.id,
          device_name: userAgentInfo,
          // refresh_token: null,
          status: false,
        },
      });

      // console.log(accessUserToRegister);

      // User đã đăng ký , token đã được update, đã biết ở trình duyệt nào
      const accessUser = await AccessUser.findOne({
        where: {
          user_id: user.id,
          device_name: userAgentInfo,
          status: true,
        },
      });
      // console.log(accessUser);

      if (accessUserToRegister) {
        // Nếu đã verify email thì update token
        if (accessUserToRegister.status) {
          await AccessUser.update(
            {
              refresh_token: refreshToken,
            },
            {
              where: {
                user_id: user.id,
              },
            }
          );
        } else {
          const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });

          console.log(otp);
          await sendMail(
            email,
            "Xác minh tài khoản",
            `<h1>Mã xác minh là: ${otp}</h1>`
          );

          await accessUserToRegister.update(
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
        }
      } else {
        if (accessUser) {
          await AccessUser.update(
            {
              refresh_token: refreshToken,
            },
            {
              where: {
                user_id: user.id,
                device_name: userAgentInfo,
              },
            }
          );

          return successResponse(res, 200, "Đăng nhập thành công", {
            accessToken,
            refreshToken,
          });
        } else {
          const otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });

          console.log(otp);
          await sendMail(
            email,
            "Xác minh tài khoản",
            `<h1>Mã xác minh là: ${otp}</h1>`
          );
          await AccessUser.create({
            user_id: user.id,
            device_name: userAgentInfo,
            otp: otp,
          });
          return successResponse(res, 202, "Vui lòng xác minh tài khoản");
        }
      }
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
  checkEmail: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return errorResponse(res, 400, "Email không tồn tại");
    }
    const password = generator.generate({
      length: 15,
      numbers: true,
    });
    const hashPassword = bcrypt.hashSync(password, 10);
    await sendMail(
      email,
      "Mật khẩu mới",
      `<h1>Mật khẩu mới của bạn là: ${password}</h1>`
    );
    await User.update(
      {
        password: hashPassword,
      },
      {
        where: {
          email: email,
        },
      }
    );
    return successResponse(res, 200, "Email hợp lệ, đang chuyển hướng");
  },
  forgotPassword: async (req, res) => {
    try {
      const { password, repassword, email } = req.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (!password || !repassword) {
        return errorResponse(res, 400, "Vui lòng nhập đầy đủ thông tin");
      }

      console.log("password", password);
      console.log("userPassword", user.password);
      const checkPassword = bcrypt.compareSync(password, user.password);
      if (!checkPassword) {
        return errorResponse(res, 400, "Mật khẩu không khớp");
      }

      if (repassword.trim().length < 8) {
        return errorResponse(res, 400, "Mật khẩu phải có ít nhất 8 ký tự");
      }

      const saltRounds = 10;
      const hashPassword = bcrypt.hashSync(repassword, saltRounds);
      await User.update(
        {
          password: hashPassword,
        },
        {
          where: {
            email: email,
          },
        }
      );
      return successResponse(res, 200, "Đổi mật khẩu thành công");
    } catch (e) {
      console.log(e);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
  refresh: async (req, res) => {
    // Cap lai access token moi
    const { refresh_token: refreshToken } = req.body;
    console.log(refreshToken);
    if (!refreshToken) {
      return errorResponse(
        res,
        400,
        "Bad Request",
        "Vui lòng cung cấp refresh token"
      );
    }
    try {
      const decode = decodeToken(refreshToken);
      const userToken = await AccessUser.findOne({
        where: {
          refresh_token: refreshToken,
        },
      });
      if (!userToken) {
        throw new Error("Token not exists");
      }

      // Khởi tạo accessToken mới
      const accessToken = createAccessToken({ userId: userToken.user_id });
      const newRefreshToken = createRefreshToken();
      console.log(newRefreshToken);
      await AccessUser.update(
        {
          refresh_token: newRefreshToken,
        },
        {
          where: {
            refresh_token: refreshToken,
          },
        }
      );
      const decodedAccess = decodeToken(accessToken);
      return successResponse(res, 200, "Success", {
        accessToken,
        refreshToken: newRefreshToken,
        expAccess: decodedAccess.exp,
      });
    } catch (e) {
      console.log(e);
      return errorResponse(res, 401, "Unauthorized");
    }
  },

  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.userId;
      const accessToken = req.headers.authorization?.replace("Bearer ", "");

      if (refreshToken) {
        await AccessUser.update(
          {
            refresh_token: null,
          },
          {
            where: {
              refresh_token: refreshToken,
              user_id: userId,
            },
          }
        );
      }

      if (accessToken) {
        // Thêm access token vào blacklist
        await BlackList.create({
          token: accessToken,
          expire: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
        });
      }

      return successResponse(res, 200, "Đăng xuất thành công");
    } catch (error) {
      console.error("Logout error:", error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra khi đăng xuất");
    }
  },
};
