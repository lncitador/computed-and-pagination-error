import Configure from '@adonisjs/core/commands/configure';
import { ConfigProvider } from '@adonisjs/core/types';
import { InertiaConfig, ResolvedConfig } from './src/types.js';
import '@adonisjs/core/http';
import '@adonisjs/lucid/types/model';
import 'luxon';

/**
 * Configures the package
 */
declare function configure(command: Configure): Promise<void>;

/**
 * Define the Inertia configuration
 */
declare function defineConfig(config: InertiaConfig): ConfigProvider<ResolvedConfig>;

declare const stubsRoot: string;

export { configure, defineConfig, stubsRoot };
