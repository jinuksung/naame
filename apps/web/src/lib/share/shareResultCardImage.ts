import { toBlob } from "html-to-image";

interface ShareResultCardImageOptions {
  element: HTMLElement;
  fileName: string;
  title: string;
}

export type ShareResultMode =
  | "native_file"
  | "native_text"
  | "download"
  | "preview";

const SHARE_TIMEOUT_MS = 4000;

class ShareTimeoutError extends Error {
  constructor() {
    super("share timeout");
    this.name = "ShareTimeoutError";
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function withShareTimeout(task: Promise<void>): Promise<void> {
  let timeoutId: number | undefined;
  try {
    await Promise.race([
      task,
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new ShareTimeoutError());
        }, SHARE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

function sanitizeFileBaseName(value: string): string {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isDesktopLikeEnvironment(): boolean {
  return !/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

function openPreviewBlob(blob: Blob): boolean {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

export async function shareResultCardImage(
  options: ShareResultCardImageOptions,
): Promise<ShareResultMode> {
  const blob = await toBlob(options.element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
  });

  if (!blob) {
    throw new Error("공유 이미지를 생성하지 못했습니다.");
  }

  const file = new File([blob], options.fileName, { type: "image/png" });
  const navigatorWithCanShare = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  const canUseNativeShare = typeof navigatorWithCanShare.share === "function";
  let fileShareTimedOut = false;

  if (canUseNativeShare) {
    try {
      await withShareTimeout(
        navigatorWithCanShare.share({
          files: [file],
          title: options.title,
          text: options.title,
        }),
      );
      return "native_file";
    } catch (error) {
      if (isAbortError(error)) {
        return "native_file";
      }
      fileShareTimedOut = error instanceof ShareTimeoutError;
    }
  }

  if (canUseNativeShare && !fileShareTimedOut) {
    try {
      await withShareTimeout(
        navigatorWithCanShare.share({
          title: options.title,
          text: options.title,
          url: window.location.href,
        }),
      );
      return "native_text";
    } catch (error) {
      if (isAbortError(error)) {
        return "native_text";
      }
    }
  }

  if (isDesktopLikeEnvironment()) {
    openPreviewBlob(blob);
    return "preview";
  }

  downloadBlob(blob, options.fileName);
  return "download";
}

export async function shareFreeResultCard(
  element: HTMLElement,
  displayName: string,
): Promise<ShareResultMode> {
  const namePart = sanitizeFileBaseName(displayName) || "name";
  return shareResultCardImage({
    element,
    title: `${displayName} 이름 카드`,
    fileName: `namefit-free-${namePart}.png`,
  });
}

export async function sharePremiumResultCard(
  element: HTMLElement,
  displayName: string,
): Promise<ShareResultMode> {
  const namePart = sanitizeFileBaseName(displayName) || "name";
  return shareResultCardImage({
    element,
    title: `${displayName} 프리미엄 리포트`,
    fileName: `namefit-premium-${namePart}.png`,
  });
}
