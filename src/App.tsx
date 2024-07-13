import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Symbol from './pages/Symbol';
import Wrapper from './components/Wrapper';



const App = () => {
  // https://semaphoreci.com/blog/routing-layer-react
  const router = createBrowserRouter([
    {
      element: <Wrapper />,
      // errorElement: <Page404 />,
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
        }
      ],
    },
  ])

  return (
    <RouterProvider router={router} />
  )

  // return (
  //   <Router>
  //   <header>

  //   </header>
  //   <main>
  //     <Routes>
  //       <Route path="/">
  //         <Home />
  //       </Route>
  //     </Routes>
  //   </main>
  // </Router>
  // )
}


// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>

//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

export default App
