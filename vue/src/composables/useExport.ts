import MarkdownIt from 'markdown-it';

export interface UseExportOptions {
  title: string;
  content: string;
}

function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateHtmlPreview(title: string, rendered: string, fullPage = false): string {
  const styles = fullPage
    ? `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1a1a1a; background: #fafafa; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 3rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
    h3 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
    p { margin: 0.75rem 0; }
    a { color: #3b82f6; }
    code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; }
    pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: #eff6ff; border-radius: 0 4px 4px 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    img { max-width: 100%; border-radius: 8px; }
    ul, ol { padding-left: 2rem; margin: 0.5rem 0; }
    li { margin: 0.25rem 0; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  </style>`
    : `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1a1a1a; background: #fafafa; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 3rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
    h3 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
    p { margin: 0.75rem 0; }
    a { color: #3b82f6; }
    code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; }
    pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: #eff6ff; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f3f4f6; }
    img { max-width: 100%; border-radius: 8px; }
    ul, ol { padding-left: 2rem; }
  </style>`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || '帖子'}</title>
  ${styles}
</head>
<body>
  <div class="container">
    <h1>${title || '无标题'}</h1>
    ${rendered}
  </div>
</body>
</html>`;
}

export function useExport(options: UseExportOptions) {
  function exportAsMd(): void {
    if (!options.content) return;
    downloadFile(options.content, `${options.title || 'untitled'}.md`, 'text/markdown');
  }

  function exportAsHtml(): void {
    if (!options.content) return;
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    let rendered = md.render(options.content);
    rendered = renderMediaTagsForExport(rendered);
    const fullHtml = generateHtmlPreview(options.title, rendered, true);
    downloadFile(fullHtml, `${options.title || 'untitled'}.html`, 'text/html');
  }

  function renderMediaTagsForExport(html: string): string {
    return html.replace(/\{\{media:([^}]+)\}\}/g, (_match, fileName) => {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      const mediaSrc = `/file/public?fileName=${encodeURIComponent(fileName)}`;
      if (['mp4', 'webm', 'ogg'].includes(ext)) {
        return `<video controls preload="metadata" class="max-w-full rounded-lg"><source src="${mediaSrc}" type="video/${ext}">您的浏览器不支持视频播放</video>`;
      }
      if (['mp3', 'wav', 'aac'].includes(ext)) {
        return `<audio controls preload="metadata" class="w-full"><source src="${mediaSrc}" type="audio/${ext}">您的浏览器不支持音频播放</audio>`;
      }
      return `<img src="${mediaSrc}" alt="${fileName}" class="max-w-full rounded-lg" loading="lazy" />`;
    });
  }

  function previewInNewTab(): void {
    if (!options.content) return;
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const rendered = md.render(options.content);
    const previewHtml = generateHtmlPreview(options.title, rendered);

    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(previewHtml);
      newTab.document.close();
    }
  }

  return {
    exportAsMd,
    exportAsHtml,
    previewInNewTab,
  };
}
