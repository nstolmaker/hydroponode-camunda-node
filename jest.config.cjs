// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */

const {defaults} = require('jest-config');

// Or async function
module.exports = () => {
  return {
    verbose: true,
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx', 'js'],
  };
};