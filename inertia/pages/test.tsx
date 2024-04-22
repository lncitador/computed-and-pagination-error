import { Head } from '@inertiajs/react'
import { InferPageProps } from '#types/inertia'
// import { InferPageProps } from '@adonisjs/inertia/types'
import TestController from '#controllers/tests_controller'

type Props = InferPageProps<TestController, 'index'>

export default function Home({ posts, user }: Props) {
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
            <strong>Name:</strong> {user.fullName}
            <strong>Email:</strong> {user.email}
          </div>
        </div>

        <div>
          <h2>Posts</h2>
          {posts.data?.map((post) => (
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
