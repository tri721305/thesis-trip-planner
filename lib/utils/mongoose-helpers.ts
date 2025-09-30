/**
 * Utility functions for working with Mongoose documents
 */

/**
 * Safely serialize a Mongoose document or array of documents to a plain JavaScript object
 * This prevents circular reference issues when passing documents from server to client
 *
 * @param doc - Mongoose document, array of documents, or plain object
 * @returns Plain JavaScript object without Mongoose metadata
 */
export function serializeDocument<T>(doc: T): T {
  if (!doc) {
    return doc;
  }

  // Handle array of documents
  if (Array.isArray(doc)) {
    return doc.map((item) => serializeDocument(item)) as unknown as T;
  }

  // Handle Mongoose documents (with toObject method)
  if (
    doc &&
    typeof doc === "object" &&
    "toObject" in doc &&
    typeof doc.toObject === "function"
  ) {
    return JSON.parse(JSON.stringify(doc.toObject()));
  }

  // Handle plain objects that might contain Mongoose documents
  if (doc && typeof doc === "object") {
    return JSON.parse(JSON.stringify(doc));
  }

  return doc;
}
