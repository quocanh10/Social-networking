import Box from "@mui/material/Box";
import { useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@heroui/react";

const INPUT_RATIO = [
  {
    value: 1 / 1,
    label: "1:1",
  },
  {
    value: 5 / 4,
    label: "5:4",
  },
  {
    value: 4 / 3,
    label: "4:3",
  },
  {
    value: 3 / 2,
    label: "3:2",
  },
  {
    value: 5 / 3,
    label: "5:3",
  },
  {
    value: 16 / 9,
    label: "16:9",
  },
  {
    value: 3 / 1,
    label: "3:1",
  },
];

export default function ImageCropper({ image, onCropDone, onCropCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedArea, setCroppedArea] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  const onCropComplete = (croppedAreaPercentage, croppedAreaPixels) => {
    // Khoảng cách từ điểm bắt đầu của ảnh đến điểm kết thúc của ảnh
    setCroppedArea(croppedAreaPixels);
  };

  const onAspectRatioChange = (e) => {
    setAspectRatio(e.target.value);
  };

  return (
    <Box>
      <Box>
        <Cropper
          image={image}
          aspect={aspectRatio}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              width: "100%",
              height: "80%",
            },
          }}
        />
      </Box>
      <Box
        style={{
          height: "20%",
        }}
        className="absolute flex gap-3 justify-center flex-col items-center bottom-0 w-full bg-black opacity-80 border-1"
      >
        <Box onChange={onAspectRatioChange} className="text-white flex gap-3">
          {INPUT_RATIO.map((item, index) => (
            <Box key={index}>
              <input type="radio" value={item.value} name="ratio" />
              <span className="text-lg"> {item.label}</span>
            </Box>
          ))}
        </Box>
        <Box className="flex gap-3 ">
          <Button color="primary" onClick={onCropCancel}>
            Cancel
          </Button>
          <Button
            color="success"
            onClick={() => {
              onCropDone(croppedArea);
            }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
