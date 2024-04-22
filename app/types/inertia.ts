import { Infer, Prettify } from './lucid.js'

export type InferPageProps<
  Controller,
  Method extends keyof Controller,
> = Controller[Method] extends (...args: any[]) => any
  ? Prettify<Infer<Exclude<Awaited<ReturnType<Controller[Method]>>, string>['props']>>
  : never
