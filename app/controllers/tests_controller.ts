import type { HttpContext } from '@adonisjs/core/http'

export default class TestsController {
  async handle({ inertia, auth }: HttpContext) {
    const posts = await auth.user?.related('posts').query().paginate(1, 10)
    return inertia.render('test', { posts, user: auth.user })
  }
}
