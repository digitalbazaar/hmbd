/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
export const witnessBody = {
  title: 'Blind witness a given cryptographic hash',
  type: 'object',
  required: ['digestMultibase'],
  additionalProperties: false,
  properties: {
    digestMultibase: {
      type: 'string'
    },
    options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        cryptosuite: {
          type: 'string',
          enum: ['ecdsa-jcs-2019', 'ecdsa-rdfc-2019', 'mldsa44-jcs-2024',
            'mldsa44-rdfc-2024']
        }
      }
    }
  }
};
