import { BrowserRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom/client";
import App from "./app";
import { MainContextProvider } from "./states";
import "./styles/index.scss";
import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from 'react-toastify';


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
    <Router basename="/admin">
        <MainContextProvider>
            <App/>
            <ToastContainer position="bottom-right" />
        </MainContextProvider>
    </Router>
);