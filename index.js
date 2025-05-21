const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

// Configure morgan logger
app.use(express.json())
app.use(cors())
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

app.get('/info', (request, response) => {
  const timestamp = new Date(Date.now());
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${timestamp.toTimeString()}</p>`)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (!person) response.status(404).end()
  response.json(person)
})

// Fix the delete method
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  console.log(id, typeof id)
  console.log(persons)
  persons = persons.filter(person => person.id !== id)
  console.log(persons)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const newPerson = {
    id: Math.floor(Math.random() * 10000).toString(),
    name: request.body.name,
    number: request.body.number,
  }

  if (!newPerson.name) {
    return response.status(400).json({ "error": "name is missing" })
  }
  if (persons.map(p => p.name).includes(newPerson.name)) {
    return response.status(400).json({ "error": "name must be unique" })
  }
  if (!newPerson.number) {
    return response.status(400).json({ "error": "number is missing" })
  }
  if (persons.map(p => p.number).includes(newPerson.number)) {
    return response.status(400).json({ "error": "number must be unique" })
  }

  persons = persons.concat(newPerson)
  return response.send(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})