import { PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useObjectUrl } from "../../hooks/use-object-url";
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
    const newFiles = Array.from(event.target.files || []);
    let updatedFiles: File[];

    if (multiple) {
      updatedFiles = [...selectedFiles, ...newFiles].slice(0, max);
    } else {
      updatedFiles = newFiles.slice(0, 1);
    }

    setSelectedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleRemoveFile = (file: File) => {
    const updatedFiles = selectedFiles.filter((f) => f !== file);
    setSelectedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const FilePreview = ({ file }: { file: File }) => {
    const objectUrl = useObjectUrl(file);

    if (!objectUrl) return null;

    return (
      <img
        src={objectUrl}
        alt={file.name}
        className="h-full w-full rounded-md object-cover"
      />
    );
  };

  const AddButton = () => (
    <button
      type="button"
      className="size-16 rounded-md border-dashed border-secondary-foreground/25 hover:border-secondary-foreground/50 text-secondary-foreground/25 hover:text-secondary-foreground/50 border-2 flex items-center cursor-pointer justify-center"
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  );

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      <div className={cn("flex gap-2", className)}>
        {selectedFiles.map((file) => (
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
            {multiple ? (
              <div className="size-16 rounded-md">
                <FilePreview file={file} />
              </div>
            ) : (
              <button
                type="button"
                className="size-16 rounded-md border-2"
                onClick={() => fileInputRef.current?.click()}
                onKeyUp={() => fileInputRef.current?.click()}
              >
                <FilePreview file={file} />
              </button>
            )}
          </div>
        ))}
        {(selectedFiles.length === 0 ||
          (multiple && selectedFiles.length < max)) && <AddButton />}
      </div>
    </div>
  );
}
