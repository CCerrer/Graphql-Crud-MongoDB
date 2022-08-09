const Koa = require('koa')
const mount = require('koa-mount')
const { graphqlHTTP } = require('koa-graphql')
const app = new Koa()
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLID
} = require('graphql')
const mongoose = require('mongoose')

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    people: {
      type: new GraphQLList(PersonType),
      resolve: async () => {
        const find = await People.find()
        return find
      }
    },
    person: {
      type: PersonType,
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { _id }) => {
        const procurado = await People.findById(_id)
        return procurado
      }
    }
  })
})
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createPerson: {
      type: PersonType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        alive: { type: GraphQLBoolean }
      },
      resolve: async (_, { name, age, alive }) => {
        const newPerson = await new People({ name, age, alive })
        newPerson.save()
        return newPerson
      }
    },
    updatePerson: {
      type: PersonType,
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        alive: { type: GraphQLBoolean }
      },
      resolve: async (_, { _id, name, age, alive }) => {
        await People.findByIdAndUpdate(_id, { name, age, alive })
        return People.findById(_id)
      }
    },
    deletePerson: {
      type: GraphQLString,
      args: {
        _id: { type: GraphQLNonNull(GraphQLID) }
      },
      resolve: async (_, { _id }) => {
        await People.findByIdAndDelete(_id)
        return `The document with ID: ${_id} was deleted`
      }
    }
  })

})

const PersonType = new GraphQLObjectType({
  name: 'PersonType',
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    alive: { type: GraphQLBoolean }
  })
})

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType })
app.use(
  mount(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: true
    })
  )
)

mongoose.connect('mongodb+srv://ferrer:w4B1kV2gH3P57Dph@cluster0.m6cypa5.mongodb.net/Teste1?retryWrites=true&w=majority')
const mongooseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  alive: {
    type: Boolean,
    default: true
  }
}, { collection: 'people' })
const People = mongoose.model('People', mongooseSchema)
app.listen(4000)
console.log('Running a GraphQL API server at http://localhost:4000/graphql')
