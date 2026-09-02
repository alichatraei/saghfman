'use client';

import { useEffect } from 'react';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'سقف من';
const DEVELOPER = 'علی چترایی';

/**
 * Attribution helpers for copied content.
 *
 * Honest scope note: nothing here can stop a determined person from copying
 * the UI — the browser must receive the HTML, CSS and images to render them,
 * and «view source» or a screenshot always works. What this does is make
 * casual copying attributed instead of anonymous:
 *
 *  1. copied text gets a source line appended to the clipboard;
 *  2. dragging images out of the page is blocked;
 *  3. the right-click menu on images is suppressed.
 *
 * Real protection comes from the legal notice in LICENSE + the footer credit,
 * and from server-side rendering of anything genuinely valuable.
 */
export function ContentProtection() {
  useEffect(() => {
    const siteUrl = window.location.origin;

    const onCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() ?? '';
      // Short snippets (a phone number, an address) stay untouched.
      if (selection.trim().length < 60 || !event.clipboardData) return;

      const notice = `\n\n— برگرفته از ${SITE_NAME} (${siteUrl})\nتوسعه‌دهنده: ${DEVELOPER}`;
      event.clipboardData.setData('text/plain', selection + notice);
      event.preventDefault();
    };

    const onDragStart = (event: DragEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'IMG') event.preventDefault();
    };

    const onContextMenu = (event: MouseEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'IMG') event.preventDefault();
    };

    document.addEventListener('copy', onCopy);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  return null;
}
