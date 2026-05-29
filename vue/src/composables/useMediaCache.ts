import { ref } from 'vue';

const DB_NAME = 'post_editor_media_cache';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';
const MEDIA_PATTERN = /\{\{media:([^}]+)\}\}/g;

export interface MediaFile {
  fileName: string;
  md5: string;
  file: File;
  mimeType: string;
  mediaType: 'image' | 'video' | 'audio';
}

export function useMediaCache() {
  const cachedFiles = ref<Map<string, MediaFile>>(new Map());

  async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'md5' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('IndexedDB 打开失败'));
    });
  }

  async function saveToDB(media: MediaFile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        md5: media.md5,
        fileName: media.fileName,
        mimeType: media.mimeType,
        mediaType: media.mediaType,
        blob: media.file,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error('IndexedDB 写入失败'));
    });
  }

  async function loadFromDB(md5: string): Promise<MediaFile | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(md5);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            fileName: result.fileName,
            md5: result.md5,
            file: new File([result.blob], result.fileName, { type: result.mimeType }),
            mimeType: result.mimeType,
            mediaType: result.mediaType,
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(new Error('IndexedDB 读取失败'));
    });
  }

  function computeMD5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const buffer = reader.result as ArrayBuffer;
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex.slice(0, 16));
        } catch {
          reject(new Error('MD5 计算失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  function detectMediaType(mimeType: string): 'image' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image';
  }

  async function cacheFile(file: File): Promise<MediaFile> {
    const md5 = await computeMD5(file);
    const mediaType = detectMediaType(file.type);

    const mediaFile: MediaFile = {
      fileName: file.name,
      md5,
      file,
      mimeType: file.type,
      mediaType,
    };

    cachedFiles.value.set(md5, mediaFile);
    await saveToDB(mediaFile);
    return mediaFile;
  }

  function generateMediaTag(mediaFile: MediaFile): string {
    const ext = mediaFile.fileName.split('.').pop();
    const fileName = `${mediaFile.fileName.split('.')[0]}_${mediaFile.md5}.${ext}`;
    return `{{media:${fileName}}}`;
  }

  async function handleFile(file: File): Promise<{ content?: string; title?: string; mediaTag?: string; mediaFile?: MediaFile; type: 'text' | 'media' }> {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const textExtensions = ['.md', '.html', '.htm', '.txt'];
    const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.mp3', '.wav', '.aac', '.mov'];

    if (textExtensions.includes(ext)) {
      const reader = new FileReader();
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file, 'UTF-8');
      });

      let title: string | undefined;
      if (ext === '.md') {
        const match = content.match(/^#\s+(.+)$/m);
        title = match ? match[1].trim() : undefined;
      } else {
        title = file.name.replace(/\.(md|html|htm|txt)$/, '');
      }

      return { type: 'text', content, title };
    }

    if (mediaExtensions.includes(ext)) {
      const mediaFile = await cacheFile(file);
      const mediaTag = generateMediaTag(mediaFile);
      return { type: 'media', mediaTag, mediaFile };
    }

    throw new Error('不支持的文件类型');
  }

  function extractMediaTags(content: string): string[] {
    const tags: string[] = [];
    let match;
    const regex = new RegExp(MEDIA_PATTERN.source, 'g');
    while ((match = regex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  function getMediaFileByTag(fileName: string): MediaFile | null {
    const md5 = fileName.split('_').pop()?.split('.')[0];
    if (md5) {
      return cachedFiles.value.get(md5) || null;
    }
    return null;
  }

  async function loadAllCachedFiles(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result as Array<{ md5: string; fileName: string; mimeType: string; mediaType: string; blob: Blob }>;
        cachedFiles.value = new Map();
        for (const item of results) {
          cachedFiles.value.set(item.md5, {
            fileName: item.fileName,
            md5: item.md5,
            file: new File([item.blob], item.fileName, { type: item.mimeType }),
            mimeType: item.mimeType,
            mediaType: item.mediaType as MediaFile['mediaType'],
          });
        }
        resolve();
      };
      request.onerror = () => reject(new Error('IndexedDB 加载失败'));
    });
  }

  function getFilesForUpload(): File[] {
    return Array.from(cachedFiles.value.values()).map(m => m.file);
  }

  function clearCache(): void {
    cachedFiles.value.clear();
  }

  return {
    cachedFiles,
    cacheFile,
    generateMediaTag,
    handleFile,
    extractMediaTags,
    getMediaFileByTag,
    loadAllCachedFiles,
    getFilesForUpload,
    clearCache,
    MEDIA_PATTERN,
  };
}
