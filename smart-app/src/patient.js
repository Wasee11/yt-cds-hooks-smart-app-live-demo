import axios from 'axios';

export function setupPatientInfo(container) {
  const FHIR_WEBHOOK_URL = 'http://localhost:5678/webhook/patient-info';

  function renderPatientInfo(data) {
    const sections = [
      {
        title: 'Personal Information',
        fields: {
          'Name': `${data.name?.[0]?.given?.join(' ')} ${data.name?.[0]?.family}`,
          'Gender': data.gender,
          'Birth Date': data.birthDate,
          'ID': data.id
        }
      },
      {
        title: 'Contact Details',
        fields: {
          'Phone': data.telecom?.find(t => t.system === 'phone')?.value,
          'Email': data.telecom?.find(t => t.system === 'email')?.value,
          'Address': data.address?.[0] ? formatAddress(data.address[0]) : 'N/A'
        }
      },
      {
        title: 'Medical Details',
        fields: {
          'Marital Status': data.maritalStatus?.text,
          'Language': data.communication?.[0]?.language?.text,
          'General Practitioner': data.generalPractitioner?.[0]?.display
        }
      }
    ];

    container.innerHTML = sections.map(section => `
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-medical-blue mb-2">${section.title}</h3>
        <div class="grid grid-cols-2 gap-2">
          ${Object.entries(section.fields).map(([key, value]) => `
            <div class="text-gray-600">${key}:</div>
            <div class="font-medium">${value || 'N/A'}</div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function formatAddress(address) {
    const parts = [
      address.line?.join(', '),
      address.city,
      address.state,
      address.postalCode,
      address.country
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

  async function fetchPatientInfo() {
    try {
      const response = await axios.get(FHIR_WEBHOOK_URL);
      if (response.data) {
        renderPatientInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching patient information:', error);
      showError();
    }
  }

  // Initial fetch
  fetchPatientInfo();

  // Refresh every 5 minutes
  setInterval(fetchPatientInfo, 5 * 60 * 1000);
}