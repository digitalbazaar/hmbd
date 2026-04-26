/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as helpers from './helpers.js';

describe('witness API', () => {
  it('witness a valid digestMultibase value', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({document: {test: '123'}});
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    const {proof} = result;
    proof.should.be.an('object');
    proof.type.should.equal('DataIntegrityProof');
    proof.proofPurpose.should.equal('assertionMethod');
    proof.verificationMethod.should.be.a('string');
    proof.created.should.be.a('string');
    proof.created.should.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    proof.proofValue.should.be.a('string');
  });

  it('fail to witness an invalid digestMultibase value', async () => {
    // wrong multibase prefix (not base58btc 'z')
    let result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'uabc123'});
    result.status.should.equal(400);

    // valid base58btc prefix but wrong multihash header (not sha2-256)
    // sha2-512 header: 0x13, 0x40
    const badHeader = new Uint8Array([0x13, 0x40, ...new Uint8Array(64)]);
    const {encode: base58Encode} = await import('base58-universal');
    result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'z' + base58Encode(badHeader)});
    result.status.should.equal(400);

    // valid prefix and header but wrong digest length (not 32 bytes)
    const badLen = new Uint8Array([0x12, 0x20, ...new Uint8Array(16)]);
    result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'z' + base58Encode(badLen)});
    result.status.should.equal(400);
  });
});
