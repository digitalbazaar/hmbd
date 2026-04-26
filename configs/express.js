/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';
import {projectName} from './project.js';

// express info
config.express.session.secret = 'NOTASECRET';
config.express.session.key = projectName + '.sid';
config.express.session.prefix = projectName + '.';

// disable sessions server wide
config.express.useSession = false;
