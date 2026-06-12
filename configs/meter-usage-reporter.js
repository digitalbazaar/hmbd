/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import {config, util} from '@bedrock/core';

const c = util.config.main;
c.setComputed('meter-usage-reporter.meterServiceAllowList', () => {
  return [
    'https://' + config.server.domain + ':' + config.server.port
  ];
});
