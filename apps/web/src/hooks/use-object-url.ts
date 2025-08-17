import { useEffect, useState } from "react";

const urlCache = new WeakMap<File | Blob, string>();
const refCounts = new WeakMap<File | Blob, number>();

function getOrCreateObjectUrl(file: File | Blob): string {
  let url = urlCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    urlCache.set(file, url);
    refCounts.set(file, 0);
  }

  const currentRefs = refCounts.get(file) || 0;
  refCounts.set(file, currentRefs + 1);

  return url;
}

function releaseObjectUrl(file: File | Blob): void {
  const currentRefs = refCounts.get(file) || 0;
  const newRefs = currentRefs - 1;

  if (newRefs <= 0) {
    const url = urlCache.get(file);
    if (url) {
      URL.revokeObjectURL(url);
      urlCache.delete(file);
      refCounts.delete(file);
    }
  } else {
    refCounts.set(file, newRefs);
  }
}

export function useObjectUrl(
  file: File | Blob | null | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = getOrCreateObjectUrl(file);
    setUrl(objectUrl);

    return () => {
      releaseObjectUrl(file);
    };
  }, [file]);

  return url;
}

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
