/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
export const mockData = {};

// A minimal JSON-LD document with an inline context for use in tests.
// JCS cryptosuites canonicalize this with JCS (RFC 8785).
// RDFC cryptosuites canonicalize this with RDFC-1.0 (n-quads).
mockData.document = {
  '@context': {
    id: '@id',
    type: '@type',
    TestDocument: 'https://vocab.example/document#TestDocument',
    name: 'https://schema.org/name'
  },
  id: 'urn:uuid:36245ee9-9074-4b05-a777-febff2e69757',
  type: 'TestDocument',
  name: 'Test document for blind witnessing'
};
