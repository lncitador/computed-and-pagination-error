import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.findBy('email', 'johndoe@email.com')

    if (user) await user.delete()

    const johndoe = await User.create({
      email: 'johndoe@email.com',
      password: '1234',
      fullName: 'John Doe',
    })

    const posts = Array.from({ length: 100 }).map((_, index) => ({
      title: `Post ${index + 1}`,
      content: `Post content ${index + 1}`,
    }))

    await johndoe.related('posts').createMany(posts)
  }
}
