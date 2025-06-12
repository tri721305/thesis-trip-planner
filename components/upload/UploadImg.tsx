"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  uploadImageAction,
  uploadMultipleImagesAction,
} from "@/lib/actions/upload.action";

export function InputFile() {
  const [file, setFile] = useState<FileList | null>(null);
  console.log("file", file);
  const handleSubmit = async () => {
    const form = new FormData();
    if (file) {
      try {
        // form.append("image", file);
        const filesArray = Array.from(file);
        const result = await uploadMultipleImagesAction(filesArray);
        console.log("result", result);
      } catch (error) {}
    }
  };
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input
        id="picture"
        type="file"
        multiple
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          console.log("file", e.target.files);
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files);
          } else {
            setFile(null);
          }
        }}
      />
      <Button disabled={!file} onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  );
}
