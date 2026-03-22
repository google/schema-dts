/**
 * Minimal valid JSON-LD object.
 */
export interface JsonLdObject {
  /** The type of the object. */
  readonly '@type': string | readonly string[];
  /** IRI identifying the canonical address of this object. */
  readonly '@id'?: string;
}

export interface IdReference {
  /** IRI identifying the canonical address of this object. */
  readonly '@id': string;
}
