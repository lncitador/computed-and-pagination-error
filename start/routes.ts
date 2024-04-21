/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import User from '#models/user'

const TestsController = () => import('#controllers/tests_controller')

router.on('/inertia').renderInertia('home', { version: 6 })
router.get('/', async ({ response, auth }) => {
  const user = await User.firstOrFail()
  await auth.use('web').login(user)
  return response.redirect().toRoute('test')
})

router.get('/test', [TestsController, 'handle']).use(middleware.auth()).as('test')
