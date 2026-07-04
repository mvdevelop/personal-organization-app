/**
 * Shared toJSON transform for Mongoose models.
 * Normalizes _id → id and removes __v across all models.
 * `_doc` param is intentionally `any` to satisfy Mongoose's complex generic signature.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toJSONTransform(_doc: any, ret: Record<string, any>) {
  ret.id = ret._id?.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}
