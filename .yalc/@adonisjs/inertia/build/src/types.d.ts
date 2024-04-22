import { HttpContext } from '@adonisjs/core/http';
import { ModelPaginatorContract, LucidModel } from '@adonisjs/lucid/types/model';
import { DateTime } from 'luxon';

/**
 * VersionCache is used to cache the version of the assets.
 *
 * If the user has provided a version, it will be used.
 * Otherwise, we will compute a hash from the manifest file
 * and cache it.
 */
declare class VersionCache {
    #private;
    protected appRoot: URL;
    protected assetsVersion?: AssetsVersion;
    constructor(appRoot: URL, assetsVersion?: AssetsVersion);
    /**
     * Pre-compute the version
     */
    computeVersion(): Promise<this>;
    /**
     * Returns the current assets version
     */
    getVersion(): string | number;
    /**
     * Set the assets version
     */
    setVersion(version: AssetsVersion): Promise<void>;
}

type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
/**
 * The `InstanceTypeModel` type is a helper type that is used to infer the instance type of a `LucidModel`
 */
type InstanceTypeModel = InstanceType<LucidModel>;
/**
 * The `KeysOfInstanceTypeModel` type is a helper type that is used to extract the keys of the `InstanceTypeModel`
 */
type KeysOfInstanceTypeModel = keyof InstanceTypeModel;
/**
 * The `KeysOfInstanceTypeRelations` type is a helper type that extends `KeysOfInstanceTypeModel`
 * and includes additional keys used in the ORM relationships such as 'instance', 'model',
 * 'client', 'builder', 'subQuery', and '__opaque_type'.
 */
type KeysOfInstanceTypeRelations = KeysOfInstanceTypeModel | 'instance' | 'model' | 'client' | 'builder' | 'subQuery' | '__opaque_type';
/**
 * The `Primitive` type is a helper type that defines the basic types that can be inferred
 */
type Primitive = string | number | boolean | undefined | null | Date;
/**
 * The `DeepInferTypeModelHelper` is a recursive type that infers the type of the properties within a model.
 * It uses the `KeysOfInstanceTypeModel` and `Primitive` helper types to infer the type of properties.
 * `T` is the type of the model, `K` is the keys that are excluded from the inference.
 */
type DeepInferTypeModelHelper<T, K extends keyof T> = {
    [P in K]: T[P] extends infer O ? O extends Primitive ? O : O extends DateTime ? Date : O extends InstanceTypeModel[] ? DeepInferTypeModelArray<Omit<O, KeysOfInstanceTypeRelations>, K>[number][] : DeepInferTypeModel<O, K | KeysOfInstanceTypeRelations> : never;
};
/**
 * The `DeepInferTypeModelArray` type is a helper type that infers the type of array properties within a model.
 * `T` is the type of the model, `K` is the keys that are excluded from the inference.
 */
type DeepInferTypeModelArray<T, K> = Prettify<{
    [P in keyof T]: DeepInferTypeModel<T[P], KeysOfInstanceTypeRelations | K>;
}>;
/**
 * The `DeepInferTypeModel` type is a recursive type that infers the type of the properties within a model.
 * It uses the `KeysOfInstanceTypeModel` and `Primitive` helper types to infer the type of properties.
 * `T` is the type of the model, `K` is the keys that are excluded from the inference.
 */
type DeepInferTypeModel<T, K> = T extends Primitive ? T : Prettify<DeepInferTypeModelHelper<T, Exclude<keyof T, K>>>;
/**
 * The `InferTypeModel` type is the final exported type that can be used to infer the types of properties
 * within a Lucid ORM model. It uses the `DeepInferTypeModel` and `KeysOfInstanceTypeModel` helper types
 * to infer the types of properties within the model.
 * `Model` is the type of the model you want to infer the properties from, `K` is the keys that are excluded from the inference.
 */
type InferTypeModel<Model, K extends keyof Model = never> = Prettify<DeepInferTypeModel<Model, K | KeysOfInstanceTypeModel>>;
type Infer<T extends object> = {
    [K in keyof T]: T[K] extends ModelPaginatorContract<infer R> ? {
        data: InferTypeModel<R>[];
        meta: {
            total: number;
            perPage: number;
            currentPage: number;
            lastPage: number;
            firstPage: number;
            firstPageUrl: string;
            lastPageUrl: string;
            nextPageUrl: string;
            previousPageUrl: string;
        };
    } : T[K] extends Array<infer R> ? InferTypeModel<R>[] : T[K] extends Array<infer R> | undefined ? InferTypeModel<R>[] | undefined : {
        [P in keyof T[K]]: T[K][P] extends Array<infer R> ? InferTypeModel<R>[] : InferTypeModel<T[K][P]>;
    };
};

type MaybePromise<T> = T | Promise<T>;
/**
 * Props that will be passed to inertia render method
 */
type PageProps = Record<string, unknown>;
/**
 * Shared data types
 */
type Data = string | number | object | boolean;
type SharedDatumFactory = (ctx: HttpContext) => MaybePromise<Data>;
type SharedData = Record<string, Data | SharedDatumFactory>;
/**
 * Allowed values for the assets version
 */
type AssetsVersion = string | number | undefined;
interface InertiaConfig {
    /**
     * Path to the Edge view that will be used as the root view for Inertia responses.
     * @default root (resources/views/inertia_layout.edge)
     */
    rootView?: string;
    /**
     * Path to your client-side entrypoint file.
     */
    entrypoint?: string;
    /**
     * The version of your assets. Every client request will be checked against this version.
     * If the version is not the same, the client will do a full reload.
     */
    assetsVersion?: AssetsVersion;
    /**
     * Data that should be shared with all rendered pages
     */
    sharedData?: SharedData;
    /**
     * Options to configure SSR
     */
    ssr?: {
        /**
         * Enable or disable SSR
         */
        enabled: boolean;
        /**
         * List of components that should be rendered on the server
         */
        pages?: string[] | ((ctx: HttpContext, page: string) => MaybePromise<boolean>);
        /**
         * Path to the SSR entrypoint file
         */
        entrypoint?: string;
        /**
         * Path to the SSR bundled file that will be used in production
         */
        bundle?: string;
    };
}
/**
 * Resolved inertia configuration
 */
interface ResolvedConfig {
    rootView: string;
    versionCache: VersionCache;
    sharedData: SharedData;
    ssr: {
        enabled: boolean;
        entrypoint: string;
        pages?: string[] | ((ctx: HttpContext, page: string) => MaybePromise<boolean>);
        bundle: string;
    };
}
interface PageObject<TPageProps extends PageProps = PageProps> {
    component: string;
    version: string | number;
    props: TPageProps;
    url: string;
    ssrHead?: string;
    ssrBody?: string;
}
/**
 * Helper for infering the page props from a Controller method that returns
 * inertia.render
 *
 * ```ts
 * // Your Adonis Controller
 * class MyController {
 *  index() {
 *   return inertia.render('foo', { foo: 1 })
 *  }
 * }
 *
 * // Your React component
 * export default MyReactComponent(props: InferPageProps<Controller, 'index'>) {
 * }
 * ```
 */
type InferPageProps<Controller, Method extends keyof Controller> = Controller[Method] extends (...args: any[]) => any ? Prettify<Infer<Exclude<Awaited<ReturnType<Controller[Method]>>, string>['props']>> : never;
/**
 * Signature for the method in the SSR entrypoint file
 */
type RenderInertiaSsrApp = (page: PageObject) => Promise<{
    head: string[];
    body: string;
}>;

export type { AssetsVersion, Data, InertiaConfig, InferPageProps, MaybePromise, PageObject, PageProps, RenderInertiaSsrApp, ResolvedConfig, SharedData, SharedDatumFactory };
