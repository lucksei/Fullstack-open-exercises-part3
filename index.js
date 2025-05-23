require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')
const person = require('./models/person')

const app = express()

// ###################
// *** Middlewares ***
// ###################

// Parse incoming requests with JSON payloads
app.use(express.json())

// Enable CORS
app.use(cors())

// serve frontend static files
app.use(express.static('dist'))

// Configure morgan logger
app.use(morgan((tokens, request, response) => {
  return [
    tokens.method(request, response),
    tokens.url(request, response),
    tokens.status(request, response),
    tokens.res(request, response, 'content-length'), '-',
    tokens['response-time'](request, response), 'ms',
    JSON.stringify(request.body),
  ].join(' ')
}))

// Initialize persons array
let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

// ##############
// *** Routes ***
// ##############

app.get('/info', (request, response) => {
  const timestamp = new Date(Date.now());
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${timestamp.toTimeString()}</p>`)
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  let newPerson = new Person({
    name: request.body.name,
    number: request.body.number
  })

  if (!newPerson.name) {
    return response.status(400).json({ "error": "name is missing" })
  }
  if (!newPerson.number) {
    return response.status(400).json({ "error": "number is missing" })
  }

  // if (persons.map(p => p.name).includes(newPerson.name)) {
  //   return response.status(400).json({ "error": "name must be unique" })
  // }
  // if (persons.map(p => p.number).includes(newPerson.number)) {
  //   return response.status(400).json({ "error": "number must be unique" })
  // }

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })

})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})