import {connectFunctionsEmulator, getFunctions} from "firebase/functions";

import {app} from "./app";
import {isProd} from "../../app/env";

const functions = getFunctions(app);
if (!isProd) {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

export {functions};
