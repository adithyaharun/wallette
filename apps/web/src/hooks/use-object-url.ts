import { useEffect, useState } from "react";

export function useObjectUrl(
  file: File | Blob | null | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return url;
}

/**
 * Utility function for temporary object URLs (e.g., for downloads)
 * Returns a cleanup function that should be called after use
 */
export function createTemporaryObjectUrl(file: File | Blob): {
  url: string;
  cleanup: () => void;
} {
  const url = URL.createObjectURL(file);
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url),
  };
}
