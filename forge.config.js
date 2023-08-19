module.exports = {
  packagerConfig: {
    asar: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy:
          "default-src 'self' 'unsafe-eval' 'unsafe-inline' static: http: https: ws:",
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/pages/app.html',
              js: './src/scripts/app.js',
              name: 'app_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
