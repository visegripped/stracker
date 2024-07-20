import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "@pages/Home";
import Alerts from "@pages/Alerts";
import Symbol from "@pages/Symbol";
import Page404 from "@pages/Page404";
import { AuthProvider } from "@context/AuthContext";
import { NotificationProvider } from "@context/NotificationContext";
import AuthButton from "@components/AuthButton";
import Notification from "@components/Notification";
import { ErrorBoundary } from "react-error-boundary";
import PathConstants from "@routes/pathConstants";
import useNotifications from "@hooks/useNotifications";

import "./App.css";

// https://medium.com/@vnkelkar11/using-error-boundary-in-react-a29ded725eee - has some examples for async/fetch as well.
function fallbackRender({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
    </div>
  );
}

const logError = (error, info) => {
  // Do something with the error, e.g. log to an external API
};

const Notifications = () => {
  const { notifications } = useNotifications();
  // console.log(" -> Notifications: ", notifications);
  const notificationList = [];
  const keys = Object.keys(notifications);
  if (keys.length) {
    keys.forEach((uuid) => {
      const { message, type } = notifications[uuid];
      notificationList.push(
        <Notification
          uuid={uuid}
          key={uuid}
          message={message}
          type={type}
        />
      );
    });
  }
  return (
    <section className="notifications-container">{notificationList}</section>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <header>
          <h1 className="logo">
            <Link to={PathConstants.HOME}>Stracker</Link>
          </h1>

          <nav className="navbar">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to={PathConstants.SYMBOL}>Symbol</Link>
              </li>
              <li className="nav-item">
                <Link to={PathConstants.ALERTS}>Alert History</Link>
              </li>
            </ul>
          </nav>

          <div className="auth">
            <AuthButton />
          </div>
        </header>

        <main>
          <ErrorBoundary
            fallbackRender={fallbackRender}
            onError={logError}
            onReset={(details) => {
              // Reset the state of your app so the error doesn't happen again - NEED TO EXPLORE THIS
            }}
          >
            <NotificationProvider>
              <Notifications />
              <Routes>
                <Route path={PathConstants.HOME} Component={Home} />
                <Route path={PathConstants.ALERTS} Component={Alerts} />
                <Route path={PathConstants.SYMBOL} Component={Symbol} />
                <Route
                  path={`${PathConstants.SYMBOL}/:symbol`}
                  Component={Symbol}
                />
                <Route Component={Page404} />
              </Routes>
            </NotificationProvider>
          </ErrorBoundary>
        </main>

        <footer></footer>
      </AuthProvider>
    </Router>
  );
};

export default App;
