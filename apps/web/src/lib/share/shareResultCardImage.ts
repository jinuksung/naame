import { toBlob } from "html-to-image";

interface ShareResultCardImageOptions {
  element: HTMLElement;
  fileName: string;
  title: string;
}

export type ShareResultMode = "native_file" | "native_text" | "download";

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
  const canShareFile =
    typeof navigatorWithCanShare.share === "function" &&
    navigatorWithCanShare.canShare?.({ files: [file] });

  if (canShareFile) {
    try {
      await navigatorWithCanShare.share({
        files: [file],
        title: options.title,
      });
      return "native_file";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "native_file";
      }
      throw error;
    }
  }

  if (typeof navigatorWithCanShare.share === "function") {
    try {
      await navigatorWithCanShare.share({
        title: options.title,
        text: options.title,
      });
      return "native_text";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "native_text";
      }
    }
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
