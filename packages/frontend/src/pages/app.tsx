import React, { Suspense } from "react";
import styled from "@emotion/styled";
import NoSSR from "react-no-ssr";
import { Router } from "@reach/router";
import { Global } from "@emotion/core";
import { TranslateProvider, Spinner, colors, baseStyles } from "@bitbloq/ui";
import { UserDataProvider } from "../lib/useUserData";
import SEO from "../components/SEO";
import { documentTypes } from "../config";

const Activate = React.lazy(() => import("../components/Activate"));
const Documents = React.lazy(() => import("../components/Documents"));
const Document = React.lazy(() => import("../components/Document"));
const PublicDocument = React.lazy(() => import("../components/PublicDocument"));
const EditDocument = React.lazy(() => import("../components/EditDocument"));
const EditExercise = React.lazy(() => import("../components/EditExercise"));
const ViewSubmission = React.lazy(() => import("../components/ViewSubmission"));
const Playground = React.lazy(() => import("../components/Playground"));

import enMessages from "../messages/en.json";
import esMessages from "../messages/es.json";

const messagesFiles = {
  en: enMessages,
  es: esMessages
};

const Route = ({
  component: Component,
  type = "",
  authenticated = false,
  ...rest
}) => (
  <Suspense fallback={<Loading type={type} />}>
    {authenticated && (
      <UserDataProvider>
        <Component {...rest} type={type} />
      </UserDataProvider>
    )}
    {!authenticated && <Component {...rest} type={type} />}
  </Suspense>
);

const AppPage = () => (
  <>
    <SEO title="App" />
    <Global styles={baseStyles} />
    <NoSSR>
      <TranslateProvider messagesFiles={messagesFiles}>
        <Router>
          <Route path="app" component={Documents} authenticated />
          <Route path="/app/document/:id" component={Document} authenticated />
          <Route path="/app/document/:id" component={Document} authenticated />
          <Route path="/app/document/:type/:id" component={EditDocument} authenticated />
          <Route
            path="/app/public-document/:type/:id"
            component={PublicDocument}
          />
          <Route path="/app/exercise/:type/:id" component={EditExercise} authenticated />
          <Route
            path="/app/submission/:type/:id"
            component={ViewSubmission}
            authenticated
          />
          <Route path="/app/playground/:type" component={Playground} />
          <Route path="/app/activate" component={Activate} />
        </Router>
      </TranslateProvider>
    </NoSSR>
  </>
);

export default AppPage;

/* styled components */

interface LoadingProps {
  type?: string;
}
const Loading = styled(Spinner)<LoadingProps>`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: ${props =>
    (props.type && documentTypes[props.type].color) || colors.gray1};
  color: ${props => (props.type ? "white" : "inherit")};
  display: flex;
`;
