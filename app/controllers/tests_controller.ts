import Post from '#models/post'
import { serialize } from '#utils/serialize'
import type { HttpContext } from '@adonisjs/core/http'

export default class TestsController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const posts = await user.related('posts').query().paginate(1, 10)
    const teste = await Post.query().preload('user').paginate(1, 10)

    return inertia.render('test', serialize({ posts, teste, user }))
  }
}
