import { Head } from '@inertiajs/react'
import { InferPageProps } from '@adonisjs/inertia/types'

import TestController from '#controllers/tests_controller'
import Post from '#models/post'

type Props = InferPageProps<TestController, 'handle'>
//    ^^ is {}

export default function Home({ user, posts }: any) {
  return (
    <>
      <Head title="Test" />

      <div className="container">
        <h1>Test</h1>

        <div>
          <h2>User</h2>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
          <div>
            <strong>Name:</strong> {user.name}
            <strong>Email:</strong> {user.email}
          </div>
        </div>

        <div>
          <h2>Posts</h2>
          {posts.data?.map((post: Post) => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
