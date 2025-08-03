import { ToastContainer } from "react-toastify";
import AvatarStory from "./header/Avatar";
import Posts from "./posts/Posts";

export default function MainPage() {
  return (
    <div style={{ maxWidth: "630px", minWidth: "630px" }}>
      <AvatarStory />
      <Posts />
      <ToastContainer />
    </div>
  );
}
