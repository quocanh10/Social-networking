const { successResponse, errorResponse } = require("../../../utils/response");
const { Message, Thread, ThreadParticipant, User } = require("../../../models");
const { Op } = require("sequelize");

module.exports = {
  getThreads: async (req, res) => {
    const userId = req.user.userId;
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    try {
      const threads = await Thread.findAll({
        where: {
          // Chỉ lấy các thread mà user hiện tại là thành viên
          // Có thể dùng subquery hoặc join, ví dụ:
          id: {
            [Op.in]: await ThreadParticipant.findAll({
              where: { user_id: userId },
              attributes: ["thread_id"],
              raw: true,
            }).then((rows) => rows.map((row) => row.thread_id)),
          },
        },
        include: [
          {
            model: ThreadParticipant,
            as: "ThreadParticipants",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "username", "avatar_url"],
              },
            ],
          },
          {
            model: Message,
            as: "messages",
            attributes: ["id", "content", "created_at", "sender_id"],
            limit: 1,
            order: [["created_at", "DESC"]],
            separate: true,
          },
        ],
        attributes: [
          "id",
          "is_group",
          "last_message_at",
          "created_at",
          "updated_at",
        ],
        limit,
        offset,
        order: [["updated_at", "DESC"]],
      });
      return successResponse(res, 200, "Success", { threads });
    } catch (err) {
      console.error(err);
      return errorResponse(res, 500, "Lỗi lấy danh sách cuộc trò chuyện");
    }
  },

  getMessages: async (req, res) => {
    const { threadId } = req.params;
    try {
      const messages = await Message.findAll({
        where: { thread_id: threadId },
        order: [["created_at", "ASC"]],
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "username", "avatar_url"],
          },
        ],
      });
      return successResponse(res, 200, "Success", { messages });
    } catch (err) {
      console.error(err);
      return errorResponse(res, 500, "Lỗi lấy tin nhắn");
    }
  },

  sendMessage: async (req, res) => {
    const userId = req.user.userId;
    const { threadId, content } = req.body;
    try {
      const message = await Message.create({
        thread_id: threadId,
        sender_id: userId,
        content,
      });
      // Cập nhật thời gian tin nhắn cuối cùng
      await Thread.update(
        { last_message_at: new Date() },
        { where: { id: threadId } }
      );
      return successResponse(res, 200, "Success", { message });
    } catch (err) {
      console.error(err);
      return errorResponse(res, 500, "Lỗi gửi tin nhắn");
    }
  },

  createThread: async (req, res) => {
    const userId = req.user.userId;
    const { participantId } = req.body;
    try {
      if (!participantId) return errorResponse(res, 400, "Thiếu participantId");
      if (userId === Number(participantId))
        return errorResponse(res, 400, "Không thể chat với chính mình");

      // Kiểm tra user tồn tại
      const participant = await User.findByPk(participantId);
      if (!participant)
        return errorResponse(res, 404, "Người dùng không tồn tại");

      // Tìm tất cả thread mà userId và participantId là thành viên
      const threads = await Thread.findAll({
        include: [
          {
            model: ThreadParticipant,
            as: "ThreadParticipants",
            required: true,
            where: { user_id: [userId, participantId] },
          },
        ],
      });

      // Lọc thread có đúng 2 thành viên là userId và participantId
      let thread = threads.find(
        (t) =>
          t.ThreadParticipants.length === 2 &&
          t.ThreadParticipants.some((tp) => tp.user_id === userId) &&
          t.ThreadParticipants.some(
            (tp) => tp.user_id === Number(participantId)
          )
      );

      // Nếu chưa có, tạo mới
      if (!thread) {
        thread = await Thread.create();
        await ThreadParticipant.bulkCreate([
          { thread_id: thread.id, user_id: userId },
          { thread_id: thread.id, user_id: participantId },
        ]);
        thread = await Thread.findOne({
          where: { id: thread.id },
          include: [
            {
              model: ThreadParticipant,
              as: "ThreadParticipants",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "username", "avatar_url"],
                },
              ],
            },
          ],
        });
      }

      return successResponse(res, 200, "Success", { thread });
    } catch (err) {
      console.error(err);
      return errorResponse(res, 500, "Lỗi tạo cuộc trò chuyện");
    }
  },
};
