import { getSupabaseClient, getStoredSupabaseConfig } from './supabase';

const DB_NAME = 'studynest_media_store';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

export interface UploadResult {
  url: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  is_cloud: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

// Format byte sizes into human readable format (KB, MB)
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Validate Audio File
export function validateAudioFile(file: File): FileValidationResult {
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
  const name = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => name.endsWith(ext));
  const hasValidMime = file.type.startsWith('audio/') || file.type === '';

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported audio format "${file.name}". Please upload an MP3, WAV, M4A, or AAC file.`,
    };
  }

  // 50MB audio limit
  const maxAudioBytes = 50 * 1024 * 1024;
  if (file.size > maxAudioBytes) {
    return {
      valid: false,
      error: `Audio file is too large (${formatFileSize(file.size)}). Maximum recommended audio size is 50 MB.`,
    };
  }

  return { valid: true };
}

// Validate Video File
export function validateVideoFile(file: File): FileValidationResult {
  const allowedExtensions = ['.mp4', '.webm', '.mov', '.mkv'];
  const name = file.name.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => name.endsWith(ext));
  const hasValidMime = file.type.startsWith('video/') || file.type === '';

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Unsupported video format "${file.name}". Please upload an MP4 or WebM video file.`,
    };
  }

  // 150MB video limit
  const maxVideoBytes = 150 * 1024 * 1024;
  if (file.size > maxVideoBytes) {
    return {
      valid: false,
      error: `Video file is too large (${formatFileSize(file.size)}). Maximum supported file size is 150 MB. Please compress the video or select a smaller file.`,
    };
  }

  let warning: string | undefined;
  if (file.size > 50 * 1024 * 1024) {
    warning = `File size is ${formatFileSize(file.size)}. Free-tier Supabase projects require increasing the default bucket upload size limit from 50MB to 150MB in Supabase Dashboard → Storage Settings.`;
  }

  return { valid: true, warning };
}

// Initialize persistent IndexedDB for binary storage
function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'storage_path' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save Blob into persistent IndexedDB
export async function saveBlobToIndexedDB(
  storagePath: string,
  blob: Blob,
  metadata: { file_name: string; file_size: number; mime_type: string }
): Promise<void> {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = {
      storage_path: storagePath,
      blob,
      file_name: metadata.file_name,
      file_size: metadata.file_size,
      mime_type: metadata.mime_type,
      saved_at: new Date().toISOString(),
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Retrieve Blob from persistent IndexedDB
export async function getBlobFromIndexedDB(storagePath: string): Promise<Blob | null> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(storagePath);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Delete Blob from IndexedDB
export async function deleteBlobFromIndexedDB(storagePath: string): Promise<void> {
  try {
    const db = await openMediaDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(storagePath);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // safe ignore
  }
}

// Cache active Blob object URLs in memory during session
const activeBlobUrlCache = new Map<string, string>();

/**
 * Resolves any media reference (http, https, or persistent indexeddb://)
 * into a valid playable URL for <audio> and <video> tags.
 */
export async function resolveMediaUrl(rawUrl?: string): Promise<string> {
  if (!rawUrl || !rawUrl.trim()) return '';

  const clean = rawUrl.trim();

  // If already standard web URL (Supabase, CDN, HTTPS), return directly
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // If IndexedDB persistent reference (e.g. indexeddb://studynest-audio/...)
  if (clean.startsWith('indexeddb://')) {
    const storagePath = clean.replace('indexeddb://', '');

    if (activeBlobUrlCache.has(storagePath)) {
      return activeBlobUrlCache.get(storagePath)!;
    }

    const blob = await getBlobFromIndexedDB(storagePath);
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      activeBlobUrlCache.set(storagePath, objectUrl);
      return objectUrl;
    }
  }

  return clean;
}

/**
 * Uploads an audio or video file directly from the computer's file picker.
 * - If Supabase credentials are configured, uploads to Supabase Storage bucket.
 * - Otherwise, stores permanently in IndexedDB binary store so files persist across page refreshes.
 */
export async function uploadMediaFile(
  file: File,
  type: 'audio' | 'video',
  questionId: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // Sanitize file name
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${type}/${questionId || 'new'}_${timestamp}_${safeName}`;
  const bucketName = type === 'audio' ? 'studynest-audio' : 'studynest-video';

  // Progress simulation for responsive UX feedback
  if (onProgress) onProgress(15);

  // If Supabase is connected, attempt upload to Supabase Storage
  if (supabase && config.isConfigured) {
    try {
      if (onProgress) onProgress(45);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || (type === 'audio' ? 'audio/mpeg' : 'video/mp4'),
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to persistent local store:', error);
        throw error;
      }

      if (onProgress) onProgress(90);

      // Retrieve public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      // Also cache in IndexedDB as reliable offline backup
      await saveBlobToIndexedDB(storagePath, file, {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      });

      if (onProgress) onProgress(100);

      return {
        url: publicUrl,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_cloud: true,
      };
    } catch (err: any) {
      console.warn('Cloud storage error, using persistent IndexedDB binary storage:', err);
      // Fallback to IndexedDB persistent storage
    }
  }

  // Local Persistent Binary Storage (survives reloads, restarts, tabs)
  if (onProgress) onProgress(60);

  await saveBlobToIndexedDB(storagePath, file, {
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
  });

  const persistentKey = `indexeddb://${storagePath}`;

  // Pre-generate and cache object URL for immediate seamless preview
  const liveUrl = URL.createObjectURL(file);
  activeBlobUrlCache.set(storagePath, liveUrl);

  if (onProgress) onProgress(100);

  return {
    url: persistentKey,
    storage_path: storagePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    is_cloud: false,
  };
}

/**
 * Deletes media file from Supabase Storage and/or IndexedDB
 */
export async function deleteMediaFile(
  type: 'audio' | 'video',
  storagePath?: string
): Promise<void> {
  if (!storagePath) return;

  const cleanPath = storagePath.replace('indexeddb://', '');
  const bucketName = type === 'audio' ? 'studynest-audio' : 'studynest-video';
  const supabase = getSupabaseClient();

  // Delete from cloud if present
  if (supabase) {
    try {
      await supabase.storage.from(bucketName).remove([cleanPath]);
    } catch (e) {
      console.warn('Could not delete from Supabase storage:', e);
    }
  }

  // Delete from local IndexedDB
  await deleteBlobFromIndexedDB(cleanPath);

  // Revoke object URL
  if (activeBlobUrlCache.has(cleanPath)) {
    URL.revokeObjectURL(activeBlobUrlCache.get(cleanPath)!);
    activeBlobUrlCache.delete(cleanPath);
  }
}
