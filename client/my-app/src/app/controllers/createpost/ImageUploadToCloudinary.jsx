"use client";

import { Button } from "@nextui-org/react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

export default function ImageUploadToCloudinary({ onGetData }) {
  const [resource, setResource] = useState();
  return (
    <CldUploadWidget
      options={{
        sources: ["local", "url", "google_drive", "unsplash"],
      }}
      signatureEndpoint="/api/sign-cloudinary-params"
      onSuccess={(result, { widget }) => {
        onGetData(result?.info);
        setResource(result?.info); // { public_id, secure_url, etc }
        widget.close();
      }}
    >
      {({ open }) => {
        function handleOnClick() {
          setResource(undefined);
          open();
        }
        return (
          <Button color="primary" onClick={handleOnClick}>
            Upload an Image
          </Button>
        );
      }}
    </CldUploadWidget>
  );
}
