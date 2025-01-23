import { UserManager } from 'oidc-client-ts'

const userManager = new UserManager({
  authority: 'https://app.meldrx.com',
  client_id: '90ab04f60f2444da9ff14fb99dd085b1',
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
        'https://app.meldrx.com/api/fhir/eabc6487-adf2-4ab0-ab05-f9984bf2e6b9/Condition',
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