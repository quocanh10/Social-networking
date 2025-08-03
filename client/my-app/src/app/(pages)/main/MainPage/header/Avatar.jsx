import { Avatar } from "@heroui/react";

export default function AvatarStory() {
  return (
    <div className="flex overflow-x-auto flex-row gap-6 p-2  w-full">
      <div className="pl-1"></div>
      <div
        style={{
          maxWidth: "70px",
        }}
        className="p-1"
      >
        <Avatar
          isBordered
          size="lg"
          src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
          className="flex-shrink-0 cursor-pointer"
        />
        <p
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          className="text-xs mt-2 w-full"
        >
          quocanh1001
        </p>
      </div>

      <div className="px-1"></div>
    </div>
  );
}
