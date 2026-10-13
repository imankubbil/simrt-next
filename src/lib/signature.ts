export async function bacaTandaTangan(formData: FormData, namaFile: string, namaHapus: string) {
  if (formData.get(namaHapus) === "on") return null;
  const file = formData.get(namaFile);
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > 512 * 1024) throw new Error("Ukuran tanda tangan maksimal 512 KB.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isPng && !isJpeg) throw new Error("Tanda tangan harus berupa gambar PNG atau JPG.");

  return `data:${isPng ? "image/png" : "image/jpeg"};base64,${bytes.toString("base64")}`;
}
