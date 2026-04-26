/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import {agent} from '@bedrock/https-agent';
import {encode as base58Encode} from 'base58-universal';
import {config} from '@bedrock/core';
import crypto from 'node:crypto';
import {httpClient} from '@digitalbazaar/http-client';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);

export async function witnessInvalidDigest({digestMultibase, options} = {}) {
  const baseUrl = config.server.baseUri;
  const url = `${baseUrl}/witnesses/test/witness`;
  const body = {digestMultibase, ...(options && {options})};

  return httpClient.post(url, {agent, json: body, throwHttpErrors: false});
}

export async function witness({document, options} = {}) {
  // canonicalize and SHA-256 hash the document, then encode as
  // base58btc-prefixed sha2-256 multihash (digestMultibase)
  const docBytes = new TextEncoder().encode(JSON.stringify(document));
  const hashBytes = new Uint8Array(
    crypto.createHash('sha256').update(docBytes).digest());
  const mhBytes = new Uint8Array(
    SHA2_256_HEADER.length + hashBytes.length);
  mhBytes.set(SHA2_256_HEADER, 0);
  mhBytes.set(hashBytes, SHA2_256_HEADER.length);
  const digestMultibase = 'z' + base58Encode(mhBytes);

  const baseUrl = config.server.baseUri;
  const url = `${baseUrl}/witnesses/test/witness`;
  const body = {digestMultibase, ...(options && {options})};

  const response = await httpClient.post(url, {agent, json: body});
  return response.data;
}
