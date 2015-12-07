import express            from 'express';
import historyApiFallback from 'connect-history-api-fallback';
import config             from '../config';

const app   = express();
const debug = require('debug')('kit:server');
const paths = config.utils_paths;

app.use(historyApiFallback({
  verbose : false
}));

// Enable webpack middleware if the application is being
// run in development mode.
if (config.env === 'development') {
  const webpack       = require('webpack');
  const webpackConfig = require('../build/webpack/development_hot');
  const compiler      = webpack(webpackConfig);

  app.use(require('./middleware/webpack-dev')({
    compiler,
    publicPath : webpackConfig.output.publicPath
  }));
  app.use(require('./middleware/webpack-hmr')({ compiler }));
} else {
  debug(
    'Application is being run outside of development mode. This starter kit ' +
    'does not provide any production-specific server functionality. To learn ' +
    'more about deployment strategies, check out the "deployment" section ' +
    'in the README.'
  );

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.base(config.dir_dist)));
}

export default app;
