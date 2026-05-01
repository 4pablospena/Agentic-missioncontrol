export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, ready, fetch } = useUserSession()

  if (to.path === '/login') {
    if (!ready.value)
      await fetch()

    if (loggedIn.value)
      return navigateTo('/')

    return
  }

  if (!ready.value)
    await fetch()

  if (!loggedIn.value)
    return navigateTo('/login')
})
