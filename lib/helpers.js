/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';

const {config, util: {BedrockError}} = bedrock;

const PRODUCT_MAP = new Map();

bedrock.events.on('bedrock.init', async () => {
  const {products} = config['veres-meter'];
  for(const product of products) {
    PRODUCT_MAP.set(product.id, product);
  }
});

export async function getProduct({id}) {
  const product = PRODUCT_MAP.get(id);
  if(!product) {
    throw new BedrockError(`Product not found: "${id}".`, 'NotFoundError', {
      public: true,
      httpStatusCode: 404
    });
  }
  return product;
}
