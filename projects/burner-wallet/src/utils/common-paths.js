const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = {
  projectRoot: PROJECT_ROOT,
  outputPath: path.join(PROJECT_ROOT, 'dist'),
  appEntry: path.join(PROJECT_ROOT, 'src')
};
