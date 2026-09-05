// helpers/image.ts
export function getImageUrl(path?: string | null): string {
  if (!path) return "";

  // ۱. اگر قبلاً کامل است (http, https, blob) فقط normalize کن
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path.replace(/\\/g, "/");
  }

  // ۲. مسیر نسبی – base URL را اضافه کن
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  let normalizedPath = path.replace(/^\/+/, "").replace(/\\/g, "/");

  // ✅ لیست پوشه‌هایی که در storage/app/public هستند
  // هر پوشه‌ای که فایل‌های آپلودی در آن ذخیره می‌شود را اینجا اضافه کن
  const storageFolders = [
    "chat-attachments",
    "advertisement-images",
    "advertisement-images-gallery",
    "user-advertisement-images",
  
  ];

  // اگر مسیر با یکی از پوشه‌های storage شروع می‌شود و هنوز storage/ ندارد، آن را اضافه کن
  const shouldAddStorage = storageFolders.some(
    (folder) =>
      normalizedPath.startsWith(folder + "/") || normalizedPath === folder,
  );

  if (shouldAddStorage && !normalizedPath.startsWith("storage/")) {
    normalizedPath = `storage/${normalizedPath}`;
  }

  return `${baseUrl}/${normalizedPath}`;
}
