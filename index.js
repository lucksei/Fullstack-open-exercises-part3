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

// Enable CORS
app.use(cors())

// Parse incoming requests with JSON payloads
app.use(express.json())


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

// Error handler middleware

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

// ##############
// *** Routes ***
// ##############

// NOTE: Does not use mongoDB
app.get('/info', (request, response) => {
  const timestamp = new Date(Date.now());
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${timestamp.toTimeString()}</p>`)
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  return Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
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

  // if (Person.find({ number: newPerson.number })) {
  //   return response.status(400).json({ "error": "number must be unique" })
  // }

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      if (!person.number) {
        return response.status(400).json({ "error": "number is missing" })
      }

      person.number = request.body.number

      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
        .catch(error => next(error))
    })
})

// Invoke error handler middleware
app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})