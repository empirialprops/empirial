// firebase/app + firebase/storage stand-ins.
export type FirebaseApp = { name: string };
const app: FirebaseApp = { name: "[local]" };
export const initializeApp = (..._a: any[]) => app;
export const getApps = () => [app];
export const getApp = () => app;

export type FirebaseStorage = { __storage: true };
export const getStorage = (..._a: any[]): FirebaseStorage => ({ __storage: true });
const files = new Map<string, string>();
export const ref = (_s: any, path: string) => ({ fullPath: path });
export async function uploadBytes(r: { fullPath: string }, file: Blob) {
  const url = await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  files.set(r.fullPath, url);
  return { ref: r };
}
export const uploadBytesResumable = uploadBytes;
export const getDownloadURL = async (r: { fullPath: string }) => files.get(r.fullPath) ?? r.fullPath;
export const deleteObject = async (r: { fullPath: string }) => void files.delete(r.fullPath);
