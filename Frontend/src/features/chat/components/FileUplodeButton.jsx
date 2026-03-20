import React, { useRef } from "react";
import { PaperclipIcon } from "../icons";

const FileUploadButton = () => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click(); // 👈 open file picker
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // 👉 you can upload file here
    }
  };

  return (
    <div className="flex items-center gap-3">
      
      {/* 📎 Button */}
      <button
        type="button"
        onClick={handleClick}
        className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white md:flex"
      >
        <PaperclipIcon />
      </button>

      {/* 🔥 Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadButton;