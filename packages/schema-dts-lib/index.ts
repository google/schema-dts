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

type LeafLike = {'@type': string};

type LeafTypesError<T> = 'Error: Leaf types expected.' & {got: T};

type UnionToIntersection<T> = (
  T extends any ? (value: T) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type CheckLeaf<T extends LeafLike> = UnionToIntersection<T['@type']> extends never
  ? LeafTypesError<T>
  : T;

type OmitTypeProperty<T extends LeafLike> = T extends any ? Omit<T, '@type'> : never;

type MergeLeafTypesChecked<
  T extends readonly [LeafLike, ...LeafLike[]],
  TChecked extends readonly unknown[] = {[K in keyof T]: CheckLeaf<T[K]>},
> = TChecked extends readonly [LeafLike, ...LeafLike[]]
  ? UnionToIntersection<OmitTypeProperty<TChecked[number]>> & {
      '@type': {[K in keyof T]: T[K] extends {'@type': infer U} ? U : never};
    }
  : LeafTypesError<TChecked>;

/**
 * Merges a tuple of concrete leaf types into a single schema type with a
 * tuple-valued `@type`.
 */
export type MergeLeafTypes<T extends readonly [LeafLike, ...LeafLike[]]> =
  MergeLeafTypesChecked<T>;
