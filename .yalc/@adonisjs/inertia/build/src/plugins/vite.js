// src/plugins/vite.ts
function inertia(options) {
  return {
    name: "vite-plugin-inertia",
    config: (_, { command }) => {
      if (!options?.ssr?.enabled)
        return {};
      if (command === "build") {
        process.env.NODE_ENV = "production";
      }
      return {
        buildSteps: [
          {
            name: "build-client",
            description: "build inertia client bundle",
            config: { build: { outDir: "build/public/assets/" } }
          },
          {
            name: "build-ssr",
            description: "build inertia server bundle",
            config: {
              build: {
                ssr: true,
                outDir: options.ssr.output || "build/ssr",
                rollupOptions: { input: options.ssr.entrypoint }
              }
            }
          }
        ]
      };
    }
  };
}
export {
  inertia as default
};