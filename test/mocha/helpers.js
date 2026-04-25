/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
export async function witness({config, document} = {}) {
  const url = `${config.id}/witness`;

  // FIXME: replace with witness call
  console.log({url, config, document});

  return {};
}
