import { Outlet, Link } from "react-router-dom"
import { Suspense } from "react";
import './Wrapper.css'
import PathConstants from '../../routes/pathConstants';
import { AuthProvider} from '../../context/AuthContext';
import AuthButton from '../AuthButton';
import { ErrorBoundary } from "react-error-boundary"

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

export default function Wrapper() {
  return (
    <ErrorBoundary fallbackRender={fallbackRender} onError={logError} onReset={(details) => {
      // Reset the state of your app so the error doesn't happen again - NEED TO EXPLORE THIS
    }}>
    <AuthProvider>
      <header>
          <h1 className="logo">
          <Link to={PathConstants.HOME}>Stracker</Link>
          </h1>

          <nav className="navbar">
            <ul className="nav-list">
              <li className="nav-item"><Link to={PathConstants.SYMBOL}>Symbol</Link></li>
              <li className="nav-item"><Link to={PathConstants.ALERTS}>Alert History</Link></li>
            </ul>
          </nav>

          <div className='auth'>
            <AuthButton />
            </div>
      </header>
      <main>
        <Suspense fallback={<div>Loading content...</div>}><Outlet /></Suspense>
      </main>
      <footer>Footer - <Link to={`${PathConstants.SYMBOL}/AAPL`}>AAPL</Link></footer>
      </AuthProvider></ErrorBoundary>
  )
}