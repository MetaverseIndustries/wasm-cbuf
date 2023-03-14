import { MessageDefinition } from "@foxglove/message-definition"

declare module "wasm-cbuf" {
  export type CbufMessageDefinition = MessageDefinition & {
    /** The hash value of the `.cbuf` message definition */
    hashValue: bigint
    /** Line number of the beginning of the struct definition */
    line: number
    /** Column number of the beginning of the struct definition */
    column: number
    /** If true, this struct is not prefixed with a cbuf message header */
    naked: boolean
    /**
     * If true, the layout of this struct on disk and in memory are the same. It has no strings or
     * variable length arrays.
     */
    simple: boolean
    /**
     * True if this struct or any nested struct contains a compact array. A compact array is
     * fixed-length at runtime but is serialized to disk as a length-prefixed dynamic array. This is
     * represented as a `MessageDefinitionField` with the `arrayUpperBound` property set.
     */
    hasCompact: boolean
  }

  export type CbufTypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array

  export type CbufValue =
    | boolean
    | number
    | bigint
    | string
    | CbufTypedArray
    | CbufValue[]
    | Record<string, CbufValue>

  export type CbufMessage = {
    /** The fully qualified message name */
    typeName: string
    /** The size of the message header and message data, in bytes */
    size: number
    /** The hash value of the `.cbuf` message definition */
    hashValue: bigint
    /** A timestamp in seconds since the Unix epoch as a 64-bit float */
    timestamp: number
    /** The deserialized messge data */
    message: Record<string, CbufValue>
  }

  export type CbufMessageMap = Map<string, CbufMessageDefinition>
  export type CbufHashMap = Map<bigint, CbufMessageDefinition>

  type Cbuf = {
    /** A promise that completes when the wasm module is loaded and ready */
    isLoaded: Promise<void>
    /**
     * Parse a CBuf `.cbuf` schema into an object containing an error string or a
     * `Map<string, MessageDefinition>`.
     *
     * @param schemaText The schema text to parse. This is the contents of a `.cbuf` file where
     *   all #include statements have been expanded.
     * @returns An object containing the parsed schema as a Map<string, MessageDefinition> mapping
     *   fully qualified message names to their parsed definition, or an error string if parsing
     *   failed.
     */
    parseCBufSchema: (schemaText: string) => { error?: string; schema: CbufMessageMap }
    /**
     * Takes a parsed schema (`Map<string, MessageDefinition>`) which maps message names to message
     * definitions and returns a new `Map<bigint, MessageDefinition>` mapping hash values to message
     * definitions.
     *
     * @returns Mapping from hash values to message definitions.
     */
    schemaMapToHashMap: (schemaMap: CbufMessageMap) => CbufHashMap
    /**
     * Given a schema hash map (`Map<bigint, MessageDefinition>`), a byte buffer, and optional offset
     * into the buffer, deserialize the buffer into a JavaScript object representing a single non-naked
     * struct message, which includes a message header and message data.
     *
     * @param hashMap A map of hash values to message definitions obtained from `parseCBufSchema()`
     *   then `schemaMapToHashMap()`.
     * @param data The byte buffer to deserialize from.
     * @param offset Optional byte offset into the buffer to deserialize from.
     * @returns A JavaScript object representing the deserialized message header fields and message
     *   data.
     */
    deserializeMessage: (hashMap: CbufHashMap, data: Uint8Array, offset?: number) => CbufMessage
  }

  const cbuf: Cbuf
  export default cbuf
}
