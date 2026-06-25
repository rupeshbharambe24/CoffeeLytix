import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

export interface UploadResult {
  url: string;
  path: string;
}

export type UploadFolder = "entries" | "beans" | "cafes" | "equipment";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Upload an image to Cloud Storage and return its download URL + storage path. */
export async function uploadImage(
  uid: string,
  folder: UploadFolder,
  file: File,
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image is too large (max 8 MB).");
  }
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `userUploads/${uid}/${folder}/${filename}`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type });
  const url = await getDownloadURL(objectRef);
  return { url, path };
}

/** Best-effort delete of a previously uploaded image. */
export async function deleteImageByPath(path?: string | null): Promise<void> {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // The object may already be gone — ignore.
  }
}
