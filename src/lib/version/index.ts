// Note: This *must* be destructered to avoid the entire package.json file
// being inlined into the final output bundle.
import {version as packageVersion} from "../../../package.json";

export const version = `v${packageVersion}`;
