import {
  InertiaMiddleware
} from "../chunk-VCEU27I3.js";

// providers/inertia_provider.ts
import { configProvider } from "@adonisjs/core";
import { RuntimeException } from "@poppinss/utils";
import { BriskRoute } from "@adonisjs/core/http";
var InertiaProvider = class {
  constructor(app) {
    this.app = app;
  }
  /**
   * Registers edge plugin when edge is installed
   */
  async registerEdgePlugin() {
    if (!this.app.usingEdgeJS)
      return;
    const edgeExports = await import("edge.js");
    const { edgePluginInertia } = await import("../src/plugins/edge/plugin.js");
    edgeExports.default.use(edgePluginInertia());
  }
  /**
   * Register inertia middleware
   */
  async register() {
    this.app.container.singleton(InertiaMiddleware, async () => {
      const inertiaConfigProvider = this.app.config.get("inertia");
      const config = await configProvider.resolve(this.app, inertiaConfigProvider);
      const vite = await this.app.container.make("vite");
      if (!config) {
        throw new RuntimeException(
          'Invalid "config/inertia.ts" file. Make sure you are using the "defineConfig" method'
        );
      }
      return new InertiaMiddleware(config, vite);
    });
  }
  /**
   * Register edge plugin and brisk route macro
   */
  async boot() {
    await this.registerEdgePlugin();
    BriskRoute.macro("renderInertia", function(template, props, viewProps) {
      return this.setHandler(({ inertia }) => {
        return inertia.render(template, props, viewProps);
      });
    });
  }
};
export {
  InertiaProvider as default
};
