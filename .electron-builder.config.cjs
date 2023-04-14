/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = async function () {
  const { getVersion } = await import("./version/getVersion.mjs");

  return {
    directories: {
      output: "dist",
      buildResources: "buildResources"
    },
    files: ["packages/**/dist/**"],
    extraFiles: [
      {
        from: "packages/main/src/modules",
        to: "packages/main/src/modules",
        filter: ["**/*"]
      },
      {
        from: "packages/main/src/standalone",
        to: "packages/main/src/standalone",
        filter: ["**/*"]
      },
      {
        from: "packages/package.json",
        to: "packages/package.json",
        filter: ["**/*"]
      }
    ],
    extraMetadata: {
      version: getVersion()
    },

    // Specify linux target just for disabling snap compilation
    linux: {
      target: "deb"
    }
  };
};
