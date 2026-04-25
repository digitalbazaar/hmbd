/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as helpers from './helpers.js';
const {config} = bedrock;

describe('witness API', () => {
  beforeEach(async () => {
  });

  it.skip('witness a valid digestMultibase value', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({config, document: {test: '123'}});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    result.should.have.property('proof');
    result.property.should.be.a('object');
  });

  it.skip('fail to witness an invalid digestMultibase value', async () => {
  });
});
