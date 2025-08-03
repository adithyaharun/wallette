import { PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

type ImageUploadProps = {
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  className?: string;
  multiple?: boolean;
  max?: number;
};

export function ImageUpload({
  files,
  onFilesChange,
  className,
  multiple = false,
  max = 1,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(files || []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setSelectedFiles(selectedFiles);
    onFilesChange?.(selectedFiles);
  };

  const handleRemoveFile = (file: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    onFilesChange?.(selectedFiles);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div className={cn("flex gap-2", className)}>
        {selectedFiles.length ? (
          selectedFiles.map((file) =>
            multiple ? (
              <div className="size-16 rounded-md" key={file.name}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="size-16 rounded-md relative" key={file.name}>
                <button
                  type="button"
                  className="absolute -top-1 cursor-pointer -right-1 bg-red-500 text-white rounded-sm p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRemoveFile(file);
                  }}
                >
                  <XIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="size-16 rounded-md border-2"
                  key={file.name}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyUp={() => fileInputRef.current?.click()}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                </button>
              </div>
            ),
          )
        ) : (
          <button
            type="button"
            className="size-16 rounded-md border-dashed border-ring border-2 flex items-center cursor-pointer justify-center"
            onClick={() => fileInputRef.current?.click()}
            onKeyUp={() => fileInputRef.current?.click()}
          >
            <PlusIcon className="h-6 w-6 text-ring" />
          </button>
        )}
        {multiple && selectedFiles.length < max && (
          <button
            type="button"
            className="size-16 rounded-md border-dashed border-ring border-2 flex items-center cursor-pointer justify-center"
            onClick={() => fileInputRef.current?.click()}
            onKeyUp={() => fileInputRef.current?.click()}
          >
            <PlusIcon className="h-6 w-6 text-ring" />
          </button>
        )}
      </div>
    </div>
  );
}
