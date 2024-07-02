// resolvers.js
const resolvers = {
    Query: {

        //working correct
      games: async (_, __, { pool }) => {
        const [rows] = await pool.query('SELECT * FROM games');
        return rows.map(row => ({
          ...row,
          platform: row.platform.split(',').map(p => p.trim()) 
        }));
      },

      //working correct
      game: async (_, { id }, { pool }) => {
        const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [id]);
        if (rows.length > 0) {
          const game = rows[0];
          game.platform = game.platform.split(',').map(p => p.trim()); // Adjust platform format if needed
          return game;
        }
        return null; // Handle case where game with given id is not found
      },
      reviews: async (_, __, { pool }) => {
        try {
          const [rows] = await pool.query('SELECT * FROM reviews');
          return rows;
        } catch (err) {
          throw new Error(`Failed to fetch reviews: ${err.message}`);
        }
      },
      review: async (_, { id }, { pool }) => {
        try {
          const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
          return rows[0];
        } catch (err) {
          throw new Error(`Failed to fetch review with id ${id}: ${err.message}`);
        }
      },
      authors: async (_, __, { pool }) => {
        try {
          const [rows] = await pool.query('SELECT * FROM authors');
          return rows;
        } catch (err) {
          throw new Error(`Failed to fetch authors: ${err.message}`);
        }
      },
      author: async (_, { id }, { pool }) => {
        try {
          const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [id]);
          return rows[0];
        } catch (err) {
          throw new Error(`Failed to fetch author with id ${id}: ${err.message}`);
        }
      }
      // Add other queries similarly
    },

    Mutation: {
        addGame: async (_, { game }, { pool }) => {
            const { title, platform } = game;
            // Format the platforms into a comma-separated string
            const platformStr = platform.join(', ');
            try {
              const [result] = await pool.query('INSERT INTO games (title, platform) VALUES (?, ?)', [title, platformStr]);
              return { id: result.insertId, title, platform };
            } catch (err) {
              throw new Error(`Failed to add game: ${err.message}`);
            }
          },
      deleteGame: async (_, { id }, { pool }) => {
        await pool.query('DELETE FROM games WHERE id = ?', [id]);
        const [rows] = await pool.query('SELECT * FROM games');
        return rows.map(row => ({
            ...row,
            platform: row.platform.split(',').map(p => p.trim()) 
          }));
      },

      //working coorect
      updateGame: async (_, { id, edits }, { pool }) => {
        await pool.query('UPDATE games SET ? WHERE id = ?', [edits, id]);
        const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [id]);
        if (rows.length > 0) {
          const game = rows[0];
          game.platform = game.platform.split(',').map(p => p.trim()); // Adjust platform format if needed
          return game;
        }
        return null; // Handle case where game with given id is not found
      },
      // Add other mutations similarly
    },
    Game: {
      reviews: async (parent, _, { pool }) => {
        const [rows] = await pool.query('SELECT * FROM reviews WHERE game_id = ?', [parent.id]);
        return rows;
      },
      platform: async (parent, _, { pool }) => {
        try {
          const [rows] = await pool.query('SELECT platform FROM games WHERE id = ?', [parent.id]);
          if (rows.length > 0) {
            // Assuming 'platform' is stored as a comma-separated string in the database
            return rows[0].platform.split(',').map(p => p.trim());
          }
          return []; // Return an empty array if no platform data is found
        } catch (error) {
          throw new Error(`Failed to fetch platform for game ${parent.id}: ${error.message}`);
        }
      },
   
    },
      Review: {
        author: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [parent.author_id]);
          return rows[0]; // Assuming there's only one author with a given ID (which should be the case)
        },
        game: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [parent.game_id]);
          return rows[0]; // Assuming there's only one game with a given ID (which should be the case)
        },
      },
      Author: {
        reviews: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM reviews WHERE author_id = ?', [parent.id]);
          return rows;
        },
        // Add other nested resolvers similarly
      },
    // Define other type resolvers (Review, Author) similarly
  };
  
  export default resolvers;
  