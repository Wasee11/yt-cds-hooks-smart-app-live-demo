const express = require('express')

const app = express()

app.use(express.json())

app.get('/cds-services', (req, res)=> {
    res.json({
        services: [
            {
                hook: 'patient-view',
                id: '0001',
                description: 'greet the patient',
                prefetch: {
                    patient: "Patient/{{context.patientId}}",
                    conditions: "Condition?patient={{context.patientId}}&recorded-date=gt{{today() - 10 years}}"
                },
            }
        ]
    })
})

app.post('/cds-services/:id', (req, res)=> {
    console.log('id', req.params.id)
    console.log('body', req.body)

    const patient = req.body.prefetch.patient;
    const conditions = req.body.prefetch.conditions;

    const firstName = patient.name[0].given[0]
    const secondName = patient.name[0].family
    // your app logic goes here
    res.json({
        cards:
        conditions.total === 0
        ? []
        : [
            {
                summary: `Hello ${firstName} ${secondName}, you have ${conditions.total} Conditions`,
                indicator: 'warning',
                source: {
                    label: 'my service!'
                },
                links: [
                    {
                        label: 'google it',
                        url: 'https://google.com',
                        type: 'absolute' 
                    },
                    {
                        label: 'my app',
                        url: 'http://localhost:4434/launch',
                        type: 'smart' 
                    }
                ]
            }
        ]
    })
})

app.listen(4433, () => console.log('started'))