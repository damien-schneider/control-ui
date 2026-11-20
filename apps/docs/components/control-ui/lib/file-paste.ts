const FILE_PATH = /^(?:file:\/\/|~?\/|[A-Za-z]:\\).*\.[A-Za-z0-9]+$/;

/**
 * A paste is an attachment when it carries files and its text only names them.
 * CleanShot puts the image's path beside it and Finder the file's name; a spreadsheet's rendered image comes with real text.
 */
export function isFilePaste(clipboardData: DataTransfer | null): boolean {
  if (!clipboardData) return false;
  const types = Array.from(clipboardData.types);
  if (!types.includes("Files")) return false;
  if (!types.includes("text/plain")) return true;
  const names = new Set(Array.from(clipboardData.files, (file) => file.name));
  return clipboardData
    .getData("text/plain")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .every((line) => names.has(line) || FILE_PATH.test(line));
}
