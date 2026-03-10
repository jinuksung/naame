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
const SHARE_FRIENDLY_TITLE = "네임핏이 만들어준 예쁜 이름이에요🐥";
const SHARE_BRAND_TEXT = "네임핏";
const SHARE_BRAND_LOGO_PATH = "/namefit-mark.svg";

class ShareTimeoutError extends Error {
  constructor() {
    super("share timeout");
    this.name = "ShareTimeoutError";
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isShareRenderHost(element: HTMLElement): boolean {
  return (
    element.classList.contains("share-render-host") ||
    element.classList.contains("nf-share-render-host")
  );
}

function resolveCaptureSourceElement(sourceElement: HTMLElement): HTMLElement {
  if (
    isShareRenderHost(sourceElement) &&
    sourceElement.firstElementChild instanceof HTMLElement
  ) {
    return sourceElement.firstElementChild;
  }
  return sourceElement;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function waitForImagesReady(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          const onDone = (): void => {
            image.removeEventListener("load", onDone);
            image.removeEventListener("error", onDone);
            resolve();
          };
          image.addEventListener("load", onDone);
          image.addEventListener("error", onDone);
        }),
    ),
  );
}

async function waitForCaptureReady(root: HTMLElement): Promise<void> {
  const documentWithFonts = document as Document & {
    fonts?: { ready: Promise<unknown> };
  };
  if (documentWithFonts.fonts) {
    try {
      await documentWithFonts.fonts.ready;
    } catch {
      // Ignore font readiness failures and continue with capture.
    }
  }
  await waitForImagesReady(root);
  await nextFrame();
  await nextFrame();
}

function getCaptureWidth(element: HTMLElement): number {
  const rectWidth = Math.round(element.getBoundingClientRect().width);
  const layoutWidth = element.offsetWidth || element.scrollWidth;
  return Math.max(320, rectWidth || layoutWidth || 360);
}

function createCaptureStagingNode(sourceElement: HTMLElement): {
  captureElement: HTMLElement;
  cleanup: () => void;
} {
  const captureSourceElement = resolveCaptureSourceElement(sourceElement);
  const stagingRoot = document.createElement("div");
  stagingRoot.style.position = "fixed";
  stagingRoot.style.left = "0";
  stagingRoot.style.top = "0";
  stagingRoot.style.pointerEvents = "none";
  stagingRoot.style.opacity = "0";
  stagingRoot.style.zIndex = "2147483647";

  const captureElement = document.createElement("div");
  captureElement.setAttribute("data-namefit-share-capture", "true");
  const captureWidth = getCaptureWidth(captureSourceElement);
  captureElement.style.width = `${captureWidth}px`;
  captureElement.style.maxWidth = `${captureWidth}px`;
  captureElement.style.display = "grid";
  captureElement.style.gap = "10px";
  captureElement.style.background = "#ffffff";
  captureElement.style.padding = "0 0 8px";
  captureElement.style.boxSizing = "border-box";

  const cardClone = captureSourceElement.cloneNode(true) as HTMLElement;
  cardClone.style.margin = "0";
  cardClone.style.width = "100%";
  cardClone.style.maxWidth = "100%";
  cardClone.style.boxSizing = "border-box";

  const brandRow = document.createElement("div");
  brandRow.style.display = "inline-flex";
  brandRow.style.alignItems = "center";
  brandRow.style.gap = "8px";
  brandRow.style.padding = "0 12px";
  brandRow.style.color = "#5f6b7a";
  brandRow.style.fontSize = "13px";
  brandRow.style.fontWeight = "700";
  brandRow.style.letterSpacing = "-0.01em";
  brandRow.style.lineHeight = "18px";
  brandRow.style.height = "18px";
  brandRow.style.justifySelf = "start";

  const logoImage = document.createElement("img");
  logoImage.src = SHARE_BRAND_LOGO_PATH;
  logoImage.alt = "";
  logoImage.width = 18;
  logoImage.height = 18;
  logoImage.style.width = "18px";
  logoImage.style.height = "18px";
  logoImage.style.objectFit = "contain";

  const brandText = document.createElement("span");
  brandText.textContent = SHARE_BRAND_TEXT;
  brandText.style.display = "inline-flex";
  brandText.style.alignItems = "center";
  brandText.style.lineHeight = "18px";

  brandRow.append(logoImage, brandText);
  captureElement.append(cardClone, brandRow);
  stagingRoot.append(captureElement);
  document.body.append(stagingRoot);

  return {
    captureElement,
    cleanup: () => {
      stagingRoot.remove();
    },
  };
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
  const { captureElement, cleanup } = createCaptureStagingNode(options.element);
  let blob: Blob | null;
  try {
    await waitForCaptureReady(captureElement);
    blob = await toBlob(captureElement, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });
  } finally {
    cleanup();
  }

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
    title: SHARE_FRIENDLY_TITLE,
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
