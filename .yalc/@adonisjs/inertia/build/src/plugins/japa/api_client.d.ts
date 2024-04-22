import { PluginFn } from '@japa/runner/types';
import { ApplicationService } from '@adonisjs/core/types';
import { PageProps } from '../../types.js';
import '@adonisjs/core/http';
import '@adonisjs/lucid/types/model';
import 'luxon';

declare module '@japa/api-client' {
    interface ApiRequest {
        /**
         * Set `X-Inertia` header on the request
         */
        withInertia(): this;
        /**
         * Set `X-Inertia-Partial-Data` and `X-Inertia-Partial-Component` headers on the request
         */
        withInertiaPartialReload(component: string, data: string[]): this;
    }
    interface ApiResponse {
        /**
         * The inertia component
         */
        inertiaComponent?: string;
        /**
         * The inertia response props
         */
        inertiaProps: Record<string, any>;
        /**
         * Assert component name of inertia response
         */
        assertInertiaComponent(component: string): this;
        /**
         * Assert props to be exactly the same as the given props
         */
        assertInertiaProps(props: PageProps): this;
        /**
         * Assert inertia props contains a subset of the given props
         */
        assertInertiaPropsContains(props: PageProps): this;
    }
}
declare function inertiaApiClient(app: ApplicationService): PluginFn;

export { inertiaApiClient };