import { LucidModel, ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Infer, InferTypeModel, Prettify } from '../types/lucid.js'
import { SimplePaginator } from '@adonisjs/lucid/database'

function serializeModel<T extends LucidModel, R extends InstanceType<T>>(
  model: R
): InferTypeModel<R>
function serializeModel<T extends LucidModel, R extends InstanceType<T>>(
  model: R[]
): InferTypeModel<R>[]
function serializeModel<T extends LucidModel, R extends InstanceType<T>>(model: R | R[]) {
  if (Array.isArray(model)) {
    return model.map((m) => serializeModel(m))
  }

  return model.serialize() as R
}

function serializePagination<
  T extends LucidModel,
  R extends InstanceType<T>,
  M extends ModelPaginatorContract<R>,
>(paginator: M): { data: InferTypeModel<T>[]; meta: any } {
  const { meta, data } = paginator.toJSON()
  return {
    data: serializeModel(data as any),
    meta,
  } as any
}

export function serialize<T extends object>(props: T): Prettify<Infer<T>> {
  return Object.keys(props).reduce((acc, key) => {
    const value = props[key as keyof T]

    if (value instanceof SimplePaginator) {
      return { ...acc, [key]: serializePagination(value as any) }
    }

    if (value instanceof BaseModel) {
      return { ...acc, [key]: serializeModel(value) }
    }

    if (Array.isArray(value)) {
      return { ...acc, [key]: value.map((v) => (v instanceof BaseModel ? serializeModel(v) : v)) }
    }

    return { ...acc, [key]: value }
  }, {} as any)
}
