import { useContext, useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "@pages/Home";
import Alerts from "@pages/Alerts";
import Symbol from "@pages/Symbol";
import Page404 from "@pages/Page404";
import { AuthProvider, AuthContext } from "@context/AuthContext";
import { NotificationsContext } from "@context/NotificationsContext";
import AuthButton from "@components/AuthButton";
import Notification from "@components/Notification";
import { ErrorBoundary } from "react-error-boundary";
import PathConstants from "@routes/pathConstants";

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
  const { notifications } = useContext(NotificationsContext);
  const notificationList = [];
  const keys = Object.keys(notifications);
  if (keys.length) {
    keys.forEach((uuid) => {
      const { message, type } = notifications[uuid];
      notificationList.push(
        <Notification uuid={uuid} key={uuid} message={message} type={type} />
      );
    });
  }
  return (
    <section className="notifications-container">{notificationList}</section>
  );
};

const setThemeOnBody = (theme) => {
  const body = document.body;
  if(body.classList.value) {
    body.classList.replace(body.classList.value, theme);
  } else {
    body.classList.add(theme);
  }
  
}

const App = () => {
  let currentDate = new Date();
  const { accessToken } = useContext(AuthContext);
  const selectedThemeAtLoad = localStorage.getItem("theme") || "default";
  const [theme, setTheme] = useState(selectedThemeAtLoad);

  useEffect(() => {
    if (theme) {
      setThemeOnBody(theme);
    }
  }, [theme]);

  const updateTheme = () => {
    const newTheme = theme === "default" ? "akira" : "default";
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    setThemeOnBody(newTheme);
  };

  return (
    <Router>
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
          <Notifications />
          {accessToken ? (
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
          ) : (
            <div className="unauthenticated">
              <h2>You are not logged in.</h2>
              <h3>Please use the sign in button in the upper right corner.</h3>
            </div>
          )}
        </ErrorBoundary>
      </main>

      <footer>
        <div>
          &copy; Copyright 2018 - {currentDate.getFullYear()}. All rights
          reserved.
        </div>
        <div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              updateTheme();
            }}
          >
            Use {theme === "default" ? "akira" : "default"} theme
          </a>
          <span className="version">v{__APP_VERSION__}</span>
        </div>
      </footer>
    </Router>
  );
};

export default App;
