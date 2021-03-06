// We only need to import the modules necessary for initial render

import CoreLayout from '../layouts/CoreLayout';
import FormInteractiveRoute from './FormInteractive';
import DashboardRoute from './Dashboard';
import IdentityVerificationRoute from './IdentityVerification';
import LoginRoute from './Login';
import SignUpRoute from './SignUp';
import NotFoundRoute from './NotFound';
import {
  rootPath,
  loginUrl
} from 'helpers/urlHelper';

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

export default (store) => ({
  path: rootPath,
  component: CoreLayout,
  indexRoute: {
    onEnter: (nextState, replace) => replace(loginUrl())
  },
  childRoutes: [
    FormInteractiveRoute(store),
    DashboardRoute(store),
    IdentityVerificationRoute(store),
    LoginRoute(store),
    SignUpRoute(store),
    NotFoundRoute(store)
  ]
});
