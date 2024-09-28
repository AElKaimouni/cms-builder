import React, { KeyboardEvent, useEffect } from "react";
import Builder from "./builder";
import { Page } from "./classes";
import { BuilderContextProvider } from "./states";
import { BuilderFunctions, BuilderKeys, ContextObject, WapiNativeEventClick } from "./types";
import { ToastContainer, toast } from 'react-toastify';

import "./styles/index.scss";
import config from "../config";


declare global {
    interface Window {
        __builder_context: ContextObject;
        __builder_page: Page;
        __builder_keys: BuilderKeys;
        __builder_functions: BuilderFunctions;
    }
}


class BuilderRoot extends React.Component {
    state: {
        hasError: boolean;
    };
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      window.__builder_context.layout.toast("Unknown Error.", { type: "error" })
      console.error(error, errorInfo);
    }
  
    render() {

      if(config.DEV_MODE && this.state.hasError) return <h1>There is Error. Check Ur Console</h1>;

        return (
            <BuilderContextProvider context={this.state.hasError ? window.__builder_context : undefined}>
                <Builder />
                <ToastContainer 
                  position="bottom-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
              />
            </BuilderContextProvider>
        )
    }
  }

export default BuilderRoot;