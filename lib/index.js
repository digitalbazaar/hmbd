/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import {addRoutes} from './http.js';

import '@bedrock/express';
import '@bedrock/health';
import '@bedrock/https-agent';
import '@bedrock/server';
import '@bedrock/validation';

// load config
import './config.js';
import './signing.js';

bedrock.events.on('bedrock-express.configure.routes', async app => {
  await addRoutes({app, routePrefix: '/witnesses'});
});

// this should always be the last import
import '@bedrock/config-yaml';
