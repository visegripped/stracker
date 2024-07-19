import React from "react"
import PathConstants from "./pathConstants"

const Home = React.lazy(() => import("../pages/Home"))
const Alerts = React.lazy(() => import("../pages/Alerts"))
const Symbol = React.lazy(() => import("../pages/Symbol"))

const routes = [
    { path: PathConstants.HOME, element: <Home /> },
    { path: PathConstants.ALERTS, element: <Alerts /> },
    { path: PathConstants.SYMBOL, element: <Symbol /> },
]

export default routes