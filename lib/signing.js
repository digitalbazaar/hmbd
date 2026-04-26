/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import * as keystores from '@bedrock/kms/lib/keystores.js';
import * as ssm from '@bedrock/ssm-mongodb';
import {getServiceIdentities} from '@bedrock/app-identity';
import {httpsAgent} from '@bedrock/https-agent';
import {KmsClient} from '@digitalbazaar/webkms-client';

const {util: {BedrockError}} = bedrock;

export let invocationSigner;
export let kmsClient;

// ensure the witness signing keystore and key exist; create them if not;
// must run after the server is fully started so KMS HTTP calls succeed
bedrock.events.on('bedrock.started', async () => {
  const cfg = bedrock.config.hmbd;
  const {keystoreId, keyId} = cfg.signing;

  // get the service DID to use as keystore controller
  const serviceIdentities = getServiceIdentities();
  const serviceIdentity = serviceIdentities.get('blind-witness');
  if(!serviceIdentity) {
    throw new BedrockError(
      'Service identity "blind-witness" not found.',
      'InvalidStateError', {public: false});
  }
  const controller = serviceIdentity.id;
  invocationSigner = serviceIdentity.keys.capabilityInvocationKey.signer();

  kmsClient = new KmsClient({keystoreId, httpsAgent});

  // ensure keystore exists; use direct API to create with a stable ID
  try {
    await kmsClient.getKeystore({invocationSigner});
  } catch(e) {
    if(e.status !== 404) {
      throw e;
    }
    await keystores.insert({
      config: {
        id: keystoreId,
        controller,
        kmsModule: 'ssm-v1',
        sequence: 0
      }
    });
  }

  // ensure signing key exists; use direct API to create with a stable ID
  try {
    await ssm.getKeyDescription({keyId, controller});
  } catch(e) {
    if(e.name !== 'NotFoundError') {
      throw e;
    }
    // generate a P-256 signing key
    await ssm.generateKey({
      keyId,
      controller,
      operation: {
        invocationTarget: {type: 'urn:webkms:multikey:P-256'}
      }
    });
  }

  // derive the did:key verificationMethod from the public key multibase
  const {publicKeyMultibase} = await ssm.getKeyDescription(
    {keyId, controller});
  cfg.signing.verificationMethod =
    `did:key:${publicKeyMultibase}#public-key`;
});
