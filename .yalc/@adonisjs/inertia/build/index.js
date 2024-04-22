// configure.ts
import string from "@poppinss/utils/string";

// stubs/main.ts
import { getDirname } from "@poppinss/utils";
var stubsRoot = getDirname(import.meta.url);

// configure.ts
var ADAPTERS = ["vue", "react", "svelte", "solid"];
var ADAPTERS_INFO = {
  vue: {
    stubFolder: "vue",
    appExtension: "ts",
    componentsExtension: "vue",
    dependencies: [
      { name: "@inertiajs/vue3", isDevDependency: false },
      { name: "vue", isDevDependency: false },
      { name: "@vitejs/plugin-vue", isDevDependency: true }
    ],
    ssrDependencies: [{ name: "@vue/server-renderer", isDevDependency: false }],
    viteRegister: {
      pluginCall: "vue()",
      importDeclarations: [{ isNamed: false, module: "@vitejs/plugin-vue", identifier: "vue" }]
    },
    ssrEntrypoint: "inertia/app/ssr.ts"
  },
  react: {
    stubFolder: "react",
    appExtension: "tsx",
    componentsExtension: "tsx",
    dependencies: [
      { name: "@inertiajs/react", isDevDependency: false },
      { name: "react", isDevDependency: false },
      { name: "react-dom", isDevDependency: false },
      { name: "@vitejs/plugin-react", isDevDependency: true },
      { name: "@types/react", isDevDependency: true },
      { name: "@types/react-dom", isDevDependency: true }
    ],
    viteRegister: {
      pluginCall: "react()",
      importDeclarations: [{ isNamed: false, module: "@vitejs/plugin-react", identifier: "react" }]
    },
    ssrEntrypoint: "inertia/app/ssr.tsx"
  },
  svelte: {
    stubFolder: "svelte",
    appExtension: "ts",
    componentsExtension: "svelte",
    dependencies: [
      { name: "@inertiajs/svelte", isDevDependency: false },
      { name: "svelte", isDevDependency: false },
      { name: "@sveltejs/vite-plugin-svelte", isDevDependency: true }
    ],
    viteRegister: {
      pluginCall: "svelte()",
      ssrPluginCall: "svelte({ compilerOptions: { hydratable: true } })",
      importDeclarations: [
        { isNamed: true, module: "@sveltejs/vite-plugin-svelte", identifier: "svelte" }
      ]
    },
    ssrEntrypoint: "inertia/app/ssr.ts"
  },
  solid: {
    stubFolder: "solid",
    appExtension: "tsx",
    componentsExtension: "tsx",
    dependencies: [
      { name: "solid-js", isDevDependency: false },
      { name: "inertia-adapter-solid", isDevDependency: false },
      { name: "vite-plugin-solid", isDevDependency: true },
      { name: "@solidjs/meta", isDevDependency: false }
    ],
    viteRegister: {
      pluginCall: "solid()",
      ssrPluginCall: "solid({ ssr: true })",
      importDeclarations: [{ isNamed: false, module: "vite-plugin-solid", identifier: "solid" }]
    },
    ssrEntrypoint: "inertia/app/ssr.tsx"
  }
};
async function defineExampleRoute(command, codemods) {
  const tsMorph = await codemods.getTsMorphProject();
  const routesFile = tsMorph?.getSourceFile(command.app.makePath("./start/routes.ts"));
  if (!routesFile) {
    return command.logger.warning("Unable to find the routes file");
  }
  const isAlreadyDefined = routesFile.getText().includes("/inertia");
  if (isAlreadyDefined) {
    command.logger.warning("/inertia route is already defined. Skipping");
    return;
  }
  const action = command.logger.action("update start/routes.ts file");
  try {
    routesFile?.addStatements((writer) => {
      writer.writeLine(`router.on('/inertia').renderInertia('home', { version: 6 })`);
    });
    await tsMorph?.save();
    action.succeeded();
  } catch (error) {
    codemods.emit("error", error);
    action.failed(error.message);
  }
}
async function configure(command) {
  let adapter = command.parsedFlags.adapter;
  let ssr = command.parsedFlags.ssr;
  let shouldInstallPackages = command.parsedFlags.install;
  if (adapter === void 0) {
    adapter = await command.prompt.choice(
      "Select the Inertia adapter you want to use",
      ADAPTERS.map((adapterName) => string.capitalCase(adapterName)),
      { name: "adapter", result: (value) => value.toLowerCase() }
    );
  }
  if (ssr === void 0) {
    ssr = await command.prompt.confirm("Do you want to use server-side rendering?", {
      name: "ssr"
    });
  }
  if (adapter in ADAPTERS_INFO === false) {
    command.logger.error(
      `The selected adapter "${adapter}" is invalid. Select one from: ${string.sentence(
        Object.keys(ADAPTERS_INFO)
      )}`
    );
    command.exitCode = 1;
    return;
  }
  const adapterInfo = ADAPTERS_INFO[adapter];
  const codemods = await command.createCodemods();
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider("@adonisjs/inertia/inertia_provider");
  });
  await codemods.registerMiddleware("server", [
    { path: "@adonisjs/inertia/inertia_middleware", position: "after" }
  ]);
  const appExt = adapterInfo.appExtension;
  const stubFolder = adapterInfo.stubFolder;
  const compExt = adapterInfo.componentsExtension;
  await codemods.makeUsingStub(stubsRoot, "config.stub", {
    ssr,
    ssrEntrypoint: adapterInfo.ssrEntrypoint
  });
  await codemods.makeUsingStub(stubsRoot, `app.css.stub`, {});
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/root.edge.stub`, {});
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/tsconfig.json.stub`, {});
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/app.${appExt}.stub`, { ssr });
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/home.${compExt}.stub`, {});
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/errors/not_found.${compExt}.stub`, {});
  await codemods.makeUsingStub(stubsRoot, `${stubFolder}/errors/server_error.${compExt}.stub`, {});
  if (ssr) {
    await codemods.makeUsingStub(stubsRoot, `${stubFolder}/ssr.${appExt}.stub`, {});
  }
  const inertiaPluginCall = ssr ? `inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.${appExt}' } })` : `inertia({ ssr: { enabled: false } })`;
  await codemods.registerVitePlugin(inertiaPluginCall, [
    { isNamed: false, module: "@adonisjs/inertia/client", identifier: "inertia" }
  ]);
  await codemods.registerVitePlugin(
    ssr && adapterInfo.viteRegister.ssrPluginCall ? adapterInfo.viteRegister.ssrPluginCall : adapterInfo.viteRegister.pluginCall,
    adapterInfo.viteRegister.importDeclarations
  );
  const adonisjsPluginCall = `adonisjs({ entrypoints: ['inertia/app/app.${appExt}'], reload: ['resources/views/**/*.edge'] })`;
  await codemods.registerVitePlugin(adonisjsPluginCall, [
    { isNamed: false, module: "@adonisjs/vite/client", identifier: "adonisjs" }
  ]);
  await defineExampleRoute(command, codemods);
  const pkgToInstall = adapterInfo.dependencies;
  if (ssr && adapterInfo.ssrDependencies) {
    pkgToInstall.push(...adapterInfo.ssrDependencies);
  }
  if (shouldInstallPackages === void 0) {
    shouldInstallPackages = await command.prompt.confirm(
      `Do you want to install dependencies ${pkgToInstall.map((pkg) => pkg.name).join(", ")}?`,
      { name: "install" }
    );
  }
  if (shouldInstallPackages) {
    await codemods.installPackages(pkgToInstall);
  } else {
    await codemods.listPackagesToInstall(pkgToInstall);
  }
}

// src/define_config.ts
import { configProvider } from "@adonisjs/core";

// src/version_cache.ts
import { readFile } from "node:fs/promises";
var VersionCache = class {
  constructor(appRoot, assetsVersion) {
    this.appRoot = appRoot;
    this.assetsVersion = assetsVersion;
    this.#cachedVersion = assetsVersion;
  }
  #cachedVersion;
  /**
   * Compute the hash of the manifest file and cache it
   */
  async #getManifestHash() {
    try {
      const crc32 = await import("crc-32");
      const manifestPath = new URL("public/assets/manifest.json", this.appRoot);
      const manifestFile = await readFile(manifestPath, "utf-8");
      this.#cachedVersion = crc32.default.str(manifestFile);
      return this.#cachedVersion;
    } catch {
      this.#cachedVersion = "1";
      return this.#cachedVersion;
    }
  }
  /**
   * Pre-compute the version
   */
  async computeVersion() {
    if (!this.assetsVersion)
      await this.#getManifestHash();
    return this;
  }
  /**
   * Returns the current assets version
   */
  getVersion() {
    if (!this.#cachedVersion)
      throw new Error("Version has not been computed yet");
    return this.#cachedVersion;
  }
  /**
   * Set the assets version
   */
  async setVersion(version) {
    this.#cachedVersion = version;
  }
};

// src/files_detector.ts
import { locatePath } from "locate-path";
var FilesDetector = class {
  constructor(app) {
    this.app = app;
  }
  /**
   * Try to locate the entrypoint file based
   * on the conventional locations
   */
  async detectEntrypoint(defaultPath) {
    const possiblesLocations = [
      "./inertia/app/app.ts",
      "./inertia/app/app.tsx",
      "./resources/app.ts",
      "./resources/app.tsx",
      "./resources/app.jsx",
      "./resources/app.js",
      "./inertia/app/app.jsx"
    ];
    const path = await locatePath(possiblesLocations, { cwd: this.app.appRoot });
    return this.app.makePath(path || defaultPath);
  }
  /**
   * Try to locate the SSR entrypoint file based
   * on the conventional locations
   */
  async detectSsrEntrypoint(defaultPath) {
    const possiblesLocations = [
      "./inertia/app/ssr.ts",
      "./inertia/app/ssr.tsx",
      "./resources/ssr.ts",
      "./resources/ssr.tsx",
      "./resources/ssr.jsx",
      "./resources/ssr.js",
      "./inertia/app/ssr.jsx"
    ];
    const path = await locatePath(possiblesLocations, { cwd: this.app.appRoot });
    return this.app.makePath(path || defaultPath);
  }
  /**
   * Try to locate the SSR bundle file based
   * on the conventional locations
   */
  async detectSsrBundle(defaultPath) {
    const possiblesLocations = ["./ssr/ssr.js", "./ssr/ssr.mjs"];
    const path = await locatePath(possiblesLocations, { cwd: this.app.appRoot });
    return this.app.makePath(path || defaultPath);
  }
};

// src/define_config.ts
import { slash } from "@poppinss/utils";
function defineConfig(config) {
  return configProvider.create(async (app) => {
    const detector = new FilesDetector(app);
    const versionCache = new VersionCache(app.appRoot, config.assetsVersion);
    await versionCache.computeVersion();
    return {
      versionCache,
      rootView: config.rootView ?? "inertia_layout",
      sharedData: config.sharedData || {},
      entrypoint: slash(
        config.entrypoint ?? await detector.detectEntrypoint("inertia/app/app.ts")
      ),
      ssr: {
        enabled: config.ssr?.enabled ?? false,
        pages: config.ssr?.pages,
        entrypoint: config.ssr?.entrypoint ?? await detector.detectSsrEntrypoint("inertia/app/ssr.ts"),
        bundle: config.ssr?.bundle ?? await detector.detectSsrBundle("ssr/ssr.js")
      }
    };
  });
}
export {
  configure,
  defineConfig,
  stubsRoot
};