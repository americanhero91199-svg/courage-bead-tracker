const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// EAS GitHub builds run from the workspace root, but the Expo app lives in
// a subdirectory. Pointing Metro's projectRoot at the app directory ensures:
//   • expo-router discovers routes from app/   (artifacts/courage-bead-mobile/app/)
//   • expo-router's App interception in AppEntry.js is active
//   • Babel config and assets resolve relative to the app
const projectRoot = path.resolve(__dirname, "artifacts/courage-bead-mobile");
const workspaceRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch the full monorepo so Metro can bundle workspace libs (@workspace/*)
config.watchFolders = [workspaceRoot];

// Resolve modules from the app first, then the hoisted workspace root packages
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
];

module.exports = config;
