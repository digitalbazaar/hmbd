/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
export const witnessBody = {
  title: 'Blind witness a given cryptographic hash',
  type: 'object',
  required: ['digestMultibase'],
  additionalProperties: false,
  properties: {
    digestMultibase: {
      type: 'string'
    }
  }
};
