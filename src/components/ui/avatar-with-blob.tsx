import { useObjectUrl } from "../../hooks/use-object-url";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type AvatarWithBlobProps = {
  blob: File | Blob | null | undefined;
  fallback: React.ReactNode;
  alt?: string;
  className?: string;
};

/**
 * Avatar component that properly handles Blob/File objects with automatic cleanup
 */
export function AvatarWithBlob({
  blob,
  fallback,
  alt,
  className,
}: AvatarWithBlobProps) {
  const objectUrl = useObjectUrl(blob);

  return (
    <Avatar className={className}>
      <AvatarFallback>{fallback}</AvatarFallback>
      {objectUrl && <AvatarImage src={objectUrl} alt={alt} />}
    </Avatar>
  );
}
