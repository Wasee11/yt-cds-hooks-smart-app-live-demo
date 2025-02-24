import { UserManager } from 'oidc-client-ts'

const userManager = new UserManager({
  authority: 'https://app.meldrx.com',
  client_id: 'd95451438a80494d95e7203163119a9a', //provider app id
  redirect_uri: 'http://localhost:4434/callback'
})

if (location.pathname === '/launch') {
  console.log(location)
  location.search
  const extraQueryParams = {}
  const queryParams = location.search.split('?')[1].split('&').map(e => e.split('='))

  for (const entry of queryParams) {
    extraQueryParams[entry[0] === 'iss' ? 'aud' : entry[0]] = entry[1]
  }

  console.log(extraQueryParams)

  userManager.signinRedirect({
    scope: 'openid profile launch patient/*.*',
    extraQueryParams
  })
}
else if (location.pathname === '/callback') {
  console.log(location)
  userManager.signinRedirectCallback()
    .then((user) => {
      location.href = '/'
    })
} else {
  userManager.getUser()
    .then((user) => {
      const accessToken = user.access_token

      return fetch(
        'https://app.meldrx.com/api/fhir/aee14bc8-2892-4859-99c9-3b6fbd7f9fcd/Patient',   //my workspace slug
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      .then(res => res.json())
      .then(bundle => console.log(bundle))
    })
}