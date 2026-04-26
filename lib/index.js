/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {addRoutes} from './http.js';
import {createService} from '@bedrock/service-core';
import {getProduct} from './helpers.js';
import {handlers} from '@bedrock/meter-http';

import '@bedrock/express';
import '@bedrock/health';
import '@bedrock/https-agent';
// FIXME: use external KMS
import '@bedrock/kms';
import '@bedrock/kms-http';
import '@bedrock/meter';
import '@bedrock/meter-usage-reporter';
import '@bedrock/mongodb';
import '@bedrock/server';
import '@bedrock/ssm-mongodb';
import '@bedrock/validation';

// load config
import './config.js';
import './signing.js';

bedrock.events.on('bedrock.init', async () => {
  /* Handlers need to be added before `bedrock.start` is called. These are
    no-op handlers to enable meter usage without restriction */
  handlers.setCreateHandler({
    async handler({meter} = {}) {
      const {service} = await getProduct({id: meter.product.id});
      meter.serviceId = service.id;
      return {meter};
    }
  });
  handlers.setUpdateHandler({handler: ({meter} = {}) => ({meter})});
  handlers.setRemoveHandler({handler: ({meter} = {}) => ({meter})});
  handlers.setUseHandler({handler: ({meter} = {}) => ({meter})});

  const service = await createService({
    serviceType: 'witness',
    routePrefix: '/witnesses',
    storageCost: {
      config: 1,
      revocation: 1
    }
  });

  bedrock.events.on('bedrock-express.configure.routes', async app => {
    await addRoutes({app, service});
  });
});

// this should always be the last import
import '@bedrock/config-yaml';
