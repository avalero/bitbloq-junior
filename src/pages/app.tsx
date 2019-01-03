import * as React from 'react';
import {Router} from '@reach/router';
import {Global} from '@emotion/core';
import Documents from '../components/Documents';
import ThreeDDocument from '../components/ThreeDDocument';
import PrivateRoute from '../components/PrivateRoute';
import {baseStyles} from '@bitbloq/ui';
import SEO from '../components/SEO';

const AppPage = () => (
  <>
    <SEO title="App" />
    <Global styles={baseStyles} />
    <Router>
      <PrivateRoute path="/app" component={Documents} />
      <PrivateRoute path="/app/3d/:id" component={ThreeDDocument} />
    </Router>
  </>
);

export default AppPage;
