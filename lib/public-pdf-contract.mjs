const PUBLIC_PDF_PREFIX = "/legal/";
const SAFE_PATH_SEGMENT_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

/**
 * Accepts only stable, root-relative PDF paths below /legal/.
 * Validation intentionally happens before any URL decoding or path resolution.
 *
 * @param {unknown} value
 * @returns {value is string}
 */
export function isValidPublicPdfPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith(PUBLIC_PDF_PREFIX) ||
    value.includes("\\") ||
    value.includes("%") ||
    value.includes("?") ||
    value.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return false;
  }

  const segments = value.slice(1).split("/");

  return (
    segments.length >= 2 &&
    segments.every((segment) => SAFE_PATH_SEGMENT_PATTERN.test(segment)) &&
    segments.at(-1)?.endsWith(".pdf") === true
  );
}

/**
 * Returns already-validated path segments for safe filesystem resolution.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function getPublicPdfPathSegments(value) {
  if (!isValidPublicPdfPath(value)) {
    throw new TypeError(
      `Invalid public PDF path ${JSON.stringify(value)}; expected a lowercase ASCII root-relative path below ${PUBLIC_PDF_PREFIX} ending in .pdf.`,
    );
  }

  return value.slice(1).split("/");
}
