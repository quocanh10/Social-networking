import { Avatar } from "@nextui-org/react";
import Link from "next/link";

export default function Article() {
  return (
    <div
      className="p-2"
      style={{ minWidth: "383px", maxWidth: "383px", paddingLeft: "64px" }}
    >
      <div className="flex gap-3">
        <Avatar
          isBordered
          size="lg"
          src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
          className="flex-shrink-0"
        />
        <div className="flex justify-between w-full">
          <div>
            <p>
              <b>quocanh1001</b>
            </p>
            <p className="text-sm text-gray-500">Quoc Anh</p>
          </div>
          <button className="text-blue-500 text-sm">Chuyển</button>
        </div>
      </div>
      <div>
        <div className="flex pt-6 pb-4 justify-between">
          <p className="text-slate-500">Gợi ý cho bạn</p>
          <Link href="/" className="text-sm text-gray-900">
            Xem tất cả
          </Link>
        </div>
        <div className="flex gap-3">
          <Avatar
            isBordered
            size="lg"
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            className="flex-shrink-0"
          />
          <div className="flex justify-between w-full">
            <div>
              <p>
                <b>quocanh1001</b>
              </p>
              <p className="text-sm text-gray-500">Gợi ý cho bạn</p>
            </div>
            <button className="text-blue-500 text-sm">Theo dõi</button>
          </div>
        </div>
      </div>
      <footer>
        <div className="mt-8">
          <p className="text-gray-900">
            Liên hệ hỗ trợ:
            <span className="text-sm"> anhquoc10.tvt@gmail.com</span>
          </p>
          <p className="mt-6 text-center text-sm text-gray-500">
            © 2025 InstaReflection from Quoc Anh
          </p>
        </div>
      </footer>
    </div>
  );
}
