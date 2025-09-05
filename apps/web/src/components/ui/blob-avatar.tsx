import { useObjectUrl } from "../../hooks/use-object-url";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type BlobAvatarProps = React.ComponentProps<"div"> & {
  blob: File | Blob | null | undefined;
  fallback: React.ReactNode;
  alt?: string;
  className?: string;
};

export function BlobAvatar({
  blob,
  fallback,
  alt,
  className,
}: BlobAvatarProps) {
  const objectUrl = useObjectUrl(blob);

  return (
    <Avatar className={className}>
      <AvatarFallback>{fallback}</AvatarFallback>
      {objectUrl && <AvatarImage src={objectUrl} alt={alt} />}
    </Avatar>
  );
}
