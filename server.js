// server.js
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schema.js'; // Assuming your schema is in schema.js
import resolvers from './resolvers.js'; // Update with your actual resolvers file
import mysql from 'mysql2/promise'; // Using promise-based MySQL client

const app = express();

const startServer = async () => {
  try {
    // Create MySQL connection pool
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'web_app',
      password: 'test123',
      database: 'web_app',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });


  

    // Test the connection
    await pool.getConnection();

    // Pass the pool to context so resolvers can access it
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: { pool } // Pass pool to context
    });

    await server.start();

    server.applyMiddleware({ app });

    // Start the server
    app.listen({ port: 4000 }, () =>
      console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
    );
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
  }
};

startServer();
