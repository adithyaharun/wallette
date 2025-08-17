import { useEffect, useState } from "react";

interface CacheEntry {
  url: string;
  refCount: number;
  lastAccessed: number;
}

const urlCache = new Map<string, CacheEntry>();
const blobToHash = new WeakMap<File | Blob, string>();

function fnv1aHash(data: Uint8Array): string {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  return `${(hash >>> 0).toString(36)}_${data.length}`;
}

async function getBlobHash(blob: File | Blob): Promise<string> {
  const existingHash = blobToHash.get(blob);
  if (existingHash) {
    return existingHash;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  let hash: string;

  if (typeof crypto !== "undefined" && crypto.subtle) {
    try {
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      hash = fnv1aHash(data);
    }
  } else {
    hash = fnv1aHash(data);
  }

  blobToHash.set(blob, hash);
  return hash;
}

async function getOrCreateObjectUrl(file: File | Blob): Promise<string> {
  const hash = await getBlobHash(file);
  const now = Date.now();

  let entry = urlCache.get(hash);

  if (entry) {
    entry.refCount++;
    entry.lastAccessed = now;
    return entry.url;
  }

  const url = URL.createObjectURL(file);
  entry = {
    url,
    refCount: 1,
    lastAccessed: now,
  };

  urlCache.set(hash, entry);
  return url;
}

async function releaseObjectUrl(file: File | Blob): Promise<void> {
  const hash = await getBlobHash(file);
  const entry = urlCache.get(hash);

  if (!entry) return;

  entry.refCount--;

  if (entry.refCount <= 0) {
    URL.revokeObjectURL(entry.url);
    urlCache.delete(hash);
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

    let cancelled = false;

    getOrCreateObjectUrl(file).then((objectUrl) => {
      if (!cancelled) {
        setUrl(objectUrl);
      }
    });

    return () => {
      cancelled = true;
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
