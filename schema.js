export const typeDefs = `#graphql
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
    reviews :[Review!]
  }
  type Review {
    id: ID!
    rating: Int!
    content: String!
    author_id: ID!
   game_id: ID!
    game: Game!
    author : Author!
  }
  type Author {
    id: ID!
    name: String!
    verified: Boolean!
    reviews :[Review!]
  }
  type Query {
    games: [Game]
    reviews: [Review]
    authors: [Author]
    review(id: ID!): Review
    game(id:ID!):Game
    author(id:ID!):Author
  }
    type Mutation {
    addGame(game :AddGameInput): Game
    deleteGame(id :ID!):[Game]
    updateGame(id:ID! , edits:EditGameInput!):Game
    addReview(rating: Int!, content: String!, author_id: ID!, game_id: ID!): Review

    }
    input AddGameInput{
    title :String!,
    platform :[String!]!
    }
    input EditGameInput{
    
    title :String,
    platform :[String!]
    }
`
