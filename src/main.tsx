import "./patch-local-storage-for-github-pages";

import React, { StrictMode } from "react";
import { render } from "react-dom";
import App from "./App";
import "./index.scss";
import eruda from "eruda";
import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;
globalThis.Buffer = Buffer;
eruda.init();
window.onerror = (e) => {
  console.log(e);
};
render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root") as HTMLElement
);
