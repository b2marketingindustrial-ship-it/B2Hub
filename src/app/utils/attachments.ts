export const MAX_ATTACHMENT_SIZE = 9 * 1024 * 1024;

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Nao foi possivel ler o anexo."));
    };

    reader.onerror = () => reject(new Error("Nao foi possivel ler o anexo."));
    reader.readAsDataURL(file);
  });
}
