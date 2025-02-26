import { UserManager } from 'oidc-client-ts';

const userManager = new UserManager({
  authority: 'https://app.meldrx.com',
  client_id: 'd95451438a80494d95e7203163119a9a',
  redirect_uri: 'http://localhost:4434/callback',
});

export function setupPatientInfo(container) {
  function renderPatientInfo(data) {
    const sections = [
      {
        title: 'Personal Information',
        fields: {
          'Name': `${data.name?.[0]?.given?.join(' ') || ''} ${data.name?.[0]?.family || ''}`,
          'Gender': data.gender,
          'Birth Date': data.birthDate,
          'ID': data.id,
        },
      },
      {
        title: 'Contact Details',
        fields: {
          'Phone': data.telecom?.find((t) => t.system === 'phone')?.value,
          'Email': data.telecom?.find((t) => t.system === 'email')?.value,
          'Address': data.address?.[0] ? formatAddress(data.address[0]) : 'N/A',
        },
      },
      {
        title: 'Medical Details',
        fields: {
          'Marital Status': data.maritalStatus?.text,
          'Language': data.communication?.[0]?.language?.text,
          'General Practitioner': data.generalPractitioner?.[0]?.display,
        },
      },
    ];

    container.innerHTML = sections
      .map(
        (section) => `
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-medical-blue mb-2">${section.title}</h3>
        <div class="grid grid-cols-2 gap-2">
          ${Object.entries(section.fields)
            .map(
              ([key, value]) => `
            <div class="text-gray-600">${key}:</div>
            <div class="font-medium">${value || 'N/A'}</div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('');
  }

  function formatAddress(address) {
    const parts = [
      address.line?.join(', '),
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  }

  function showError() {
    container.innerHTML = `
      <div class="text-red-500 p-4 rounded-lg bg-red-50">
        Unable to load patient information. Please try again later.
      </div>
    `;
  }

  async function fetchAndRenderPatientInfo() {
    try {
      const user = await userManager.getUser();
      if (!user || user.expired) {
        // If no user or token is expired, redirect to sign in
        console.log('No valid user session, redirecting to login...');
        userManager.signinRedirect();
        return;
      }

      const accessToken = user.access_token;
      const response = await fetch('https://app.meldrx.com/api/fhir/aee14bc8-2892-4859-99c9-3b6fbd7f9fcd/Patient', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const bundle = await response.json();
      console.log('FHIR Bundle:', bundle);

      // Assuming the bundle is a Patient resource or a Bundle with Patient entries
      const patient = bundle.resourceType === 'Bundle' ? bundle.entry?.[0]?.resource : bundle;
      if (patient) {
        renderPatientInfo(patient);
      } else {
        console.error('No patient resource found in bundle:', bundle);
        showError();
      }
    } catch (error) {
      console.error('Error fetching patient information:', error);
      showError();
    }
  }

  // Handle authentication flow
  if (location.pathname === '/launch') {
    const extraQueryParams = {};
    const queryParams = location.search.split('?')[1]?.split('&').map((e) => e.split('='));
    for (const entry of queryParams) {
      extraQueryParams[entry[0] === 'iss' ? 'aud' : entry[0]] = entry[1];
    }
    userManager.signinRedirect({
      scope: 'openid profile launch patient/*.*',
      extraQueryParams,
    });
  } else if (location.pathname === '/callback') {
    userManager.signinRedirectCallback().then(() => {
      location.href = '/';
    });
  } else {
    // Initial fetch and render
    fetchAndRenderPatientInfo();

    // Optional: Refresh every 5 minutes
    setInterval(fetchAndRenderPatientInfo, 5 * 60 * 1000);
  }
}