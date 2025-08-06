"use client";

import { UploadButton } from "@/utils/uploadthing";

export default function ImageUpload({ onGetData }) {
  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // setImage(res[0].url);
          onGetData(res[0].url);
        }}
        onUploadError={(error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
