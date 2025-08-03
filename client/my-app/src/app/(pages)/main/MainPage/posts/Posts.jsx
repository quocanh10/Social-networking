"use client";

import { useEffect, useState } from "react";
import { client } from "@/app/helpers/fetch_api/client";
import Post from "./post/Post";
import { getToken } from "../../../../actions/gettoken.action";

export default function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      const { accessToken } = await getToken();

      if (!{ accessToken }) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      client.setToken(accessToken.value);
      const { data, response } = await client.get("/feed/following");
      console.log("Response:", data);
      if (response.ok) {
        setPosts(data.data.posts); // lấy danh sách post
        console.log("Posts:", data.data.posts);
      } else {
        console.error("Lỗi:", data.message);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
