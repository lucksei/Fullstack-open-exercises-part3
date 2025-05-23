const mongoose = require('mongoose')

// If no password is given, then display an error message.
if (process.argv.length <= 2) {
  console.log('command requires arguments [password]')
  process.exit(1)
}

const password = process.argv[2]
// Init mongoDB connection
const url = `mongodb+srv://luca6mandi:${password}@fullstack.tfba37t.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=fullstack`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  // If the password is the only parameter given to the program, then the program should display all of the entries in the phonebook.
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length <= 4) {
  // If the password is given but only the name or number is given, then the program should display an error message.
  console.log('command requires arguments [password] [name] [number]')
  process.exit(1)
} else if (process.argv.length === 5) {
  // If the password, name and number are given to the program, then the program should add the entry to the phonebook.
  const name = process.argv[3]
  const number = process.argv[4]
  const person = new Person({
    name: name,
    number: number,
  })
  person.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      mongoose.connection.close()
    })
    .catch((error) => console.log(error))
}







