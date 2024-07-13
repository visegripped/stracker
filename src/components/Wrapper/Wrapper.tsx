import { Outlet, Link } from "react-router-dom"
import './Wrapper.css'
import PathConstants from '../../routes/pathConstants';

export default function Wrapper() {
  return (
      <>
          <header>
        <h1>Stracker</h1>

        <nav className="navbar">
                    <ul className="nav-list">
                        <li className="nav-item"><Link to={PathConstants.HOME}>Home</Link></li>
                        <li className="nav-item"><Link to={PathConstants.SYMBOL}>Symbol</Link></li>
                        <li className="nav-item"><Link to={PathConstants.ALERTS}>Alerts</Link></li>
                    </ul>
                </nav>

          </header>
          <main>                
              <Outlet />
          </main>
          <footer>Footer</footer>
      </>
  )
}