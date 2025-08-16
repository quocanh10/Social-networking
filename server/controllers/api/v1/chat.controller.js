const { successResponse, errorResponse } = require("../../../utils/response");
const { Message, Thread, ThreadParticipant, User } = require("../../../models");

module.exports = {
  getThreads: async (req, res) => {
    const userId = req.user.id;
    try {
      const threads = await Thread.findAll({
        include: [
          {
            model: ThreadParticipant,
            include: [
              { model: User, attributes: ["id", "username", "avatar_url"] },
            ],
          },
          // last message
          {
            model: Message,
            attributes: ["id", "content", "createdAt", "senderId"],
            limit: 1,
            order: [["createdAt", "DESC"]],
            separate: true, // tránh nổ query khi group
          },
        ],
        attributes: ["id", "createdAt", "updatedAt"],
        limit,
        offset,
        order: [["updatedAt", "DESC"]],
      });
      return successResponse(res, 200, "Success", { threads });
    } catch (err) {
      return errorResponse(res, 500, "Lỗi lấy danh sách cuộc trò chuyện");
    }
  },

  getMessages: async (req, res) => {
    const { threadId } = req.params;
    try {
      const messages = await Message.findAll({
        where: { threadId },
        order: [["createdAt", "ASC"]],
        include: [
          { model: User, attributes: ["id", "username", "avatar_url"] },
        ],
      });
      return successResponse(res, 200, "Success", { messages });
    } catch (err) {
      return errorResponse(res, 500, "Lỗi lấy tin nhắn");
    }
  },

  sendMessage: async (req, res) => {
    const userId = req.user.id;
    const { threadId, content } = req.body;
    try {
      const message = await Message.create({
        threadId,
        senderId: userId,
        content,
      });
      return successResponse(res, 200, "Success", { message });
    } catch (err) {
      return errorResponse(res, 500, "Lỗi gửi tin nhắn");
    }
  },

  createThread: async (req, res) => {
    const userId = req.user.id;
    const { participantId } = req.body;
    try {
      let thread = await Thread.findOne({
        include: [
          {
            model: ThreadParticipant,
            where: { userId: [userId, participantId] },
          },
        ],
      });
      if (!thread) {
        thread = await Thread.create();
        await ThreadParticipant.bulkCreate([
          { threadId: thread.id, userId },
          { threadId: thread.id, userId: participantId },
        ]);
      }
      return successResponse(res, 200, "Success", { thread });
    } catch (err) {
      return errorResponse(res, 500, "Lỗi tạo cuộc trò chuyện");
    }
  },
};
