import { ref } from 'vue';

const ALLOWED_EXTENSIONS = ['.md', '.html', '.htm', '.txt'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function useFileImport() {
  const isDragging = ref(false);
  const isDragOverEditor = ref(false);

  function isAllowedFile(fileName: string): boolean {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext) || IMAGE_EXTENSIONS.includes(ext);
  }

  function extractTitleFromMarkdown(mdContent: string): string | null {
    const match = mdContent.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  async function handleTextFile(file: File): Promise<{ content: string; title?: string }> {
    const content = await readTextFile(file);
    let title: string | undefined;

    if (file.name.endsWith('.md')) {
      title = extractTitleFromMarkdown(content);
    } else if (file.name.endsWith('.txt')) {
      title = file.name.replace('.txt', '');
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      title = file.name.replace(/\.(html|htm)$/, '');
    }

    return { content, title };
  }

  async function handleImageFile(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩至 5MB 以内`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File): Promise<{ content?: string; title?: string; imageData?: string; type: 'text' | 'image' }> {
    if (!isAllowedFile(file.name)) {
      throw new Error('不支持的文件类型，请选择 .md、.html、.txt 或图片文件');
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (IMAGE_EXTENSIONS.includes(ext)) {
      const imageData = await handleImageFile(file);
      return { type: 'image', imageData };
    }

    const result = await handleTextFile(file);
    return { type: 'text', content: result.content, title: result.title };
  }

  function handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
    isDragOverEditor.value = true;
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (!target.closest('[data-editor-area]')) {
      isDragOverEditor.value = false;
    }
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e: DragEvent): Promise<{ content?: string; title?: string; imageData?: string; type: 'text' | 'image' } | null> {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
    isDragOverEditor.value = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return null;

    return handleFile(files[0]);
  }

  return {
    isDragging,
    isDragOverEditor,
    handleFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
