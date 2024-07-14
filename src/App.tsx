import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Symbol from './pages/Symbol';
import Page404 from './pages/Page404';
import Wrapper from './components/Wrapper';



const App = () => {
  // https://semaphoreci.com/blog/routing-layer-react
  const router = createBrowserRouter([
    {
      element: <Wrapper />,
      errorElement: <Page404 />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/alerts",
          element: <Alerts />,
        },
        {
          path: "/symbol",
          element: <Symbol />,
        },
        {
          path: "/symbol/:symbol",
          element: <Symbol />,
        }
      ],
    },
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
