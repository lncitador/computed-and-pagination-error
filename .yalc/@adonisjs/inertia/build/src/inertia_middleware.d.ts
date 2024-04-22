import { Vite } from '@adonisjs/vite';
import { HttpContext } from '@adonisjs/core/http';
import { NextFn } from '@adonisjs/core/types/http';
import { ResolvedConfig, Data, PageProps, PageObject, MaybePromise } from './types.js';
import '@adonisjs/lucid/types/model';
import 'luxon';

/**
 * Symbol used to identify lazy props
 */
declare const kLazySymbol: unique symbol;
/**
 * Main class used to interact with Inertia
 */
declare class Inertia {
    #private;
    protected ctx: HttpContext;
    protected config: ResolvedConfig;
    protected vite?: Vite | undefined;
    constructor(ctx: HttpContext, config: ResolvedConfig, vite?: Vite | undefined);
    /**
     * Share data for the current request.
     * This data will override any shared data defined in the config.
     */
    share(data: Record<string, Data>): void;
    /**
     * Render a page using Inertia
     */
    render<TPageProps extends Record<string, any> = PageProps, TViewProps extends Record<string, any> = PageProps>(component: string, pageProps?: TPageProps, viewProps?: TViewProps): Promise<string | PageObject<TPageProps>>;
    /**
     * Create a lazy prop
     *
     * Lazy props are never resolved on first visit, but only when the client
     * request a partial reload explicitely with this value.
     *
     * See https://inertiajs.com/partial-reloads#lazy-data-evaluation
     */
    lazy(callback: () => MaybePromise<any>): {
        [kLazySymbol]: () => MaybePromise<any>;
    };
    /**
     * This method can be used to redirect the user to an external website
     * or even a non-inertia route of your application.
     *
     * See https://inertiajs.com/redirects#external-redirects
     */
    location(url: string): Promise<void>;
}

/**
 * HttpContext augmentations
 */
declare module '@adonisjs/core/http' {
    interface HttpContext {
        inertia: Inertia;
    }
}
/**
 * Inertia middleware to handle the Inertia requests and
 * set appropriate headers/status
 */
declare class InertiaMiddleware {
    protected config: ResolvedConfig;
    protected vite?: Vite | undefined;
    constructor(config: ResolvedConfig, vite?: Vite | undefined);
    handle(ctx: HttpContext, next: NextFn): Promise<void>;
}

export { InertiaMiddleware as default };
