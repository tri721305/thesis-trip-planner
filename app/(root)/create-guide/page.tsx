"use client";

import { Button } from "@/components/ui/button";
import { InputFile } from "@/components/upload/UploadImg";
import React from "react";

const page = () => {
  return (
    <div>
      Create Guide
      <Button>Submit</Button>
      <InputFile />
    </div>
  );
};

export default page;
