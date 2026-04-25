/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const cfg = config['veres-meter'] = {};

cfg.products = [{
  // use default `veres-kms` dev `id` and `serviceId`
  id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a41',
  name: 'Veres KMS Platinum',
  service: {
    // default dev `id` configured in `bedrock-kms-http`
    id: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4',
    type: 'webkms'
  }
}, {
  id: 'urn:uuid:cfb3fed8-d54c-4bd2-ada9-810ec1271f0d',
  name: 'Hold My Beer Daemon',
  service: {
    // default dev `id` for blind-witness service
    id: 'did:key:z6MkpLAeP33tTCfKmAfwbQ4za5F73x5nUn2PheWMG5tXdwgE',
    type: 'blind-witness'
  }
}];
