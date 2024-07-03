
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
          game.platform = game.platform.split(',').map(p => p.trim()); 
          return game;
        }
        return null; 
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

    },

    Mutation: {
        addGame: async (_, { game }, { pool }) => {
            const { title, platform } = game;
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
          game.platform = game.platform.split(',').map(p => p.trim()); 
          return game;
        }
        return null; 
      },

      addReview: async (_, { rating, content, author_id, game_id }, { pool }) => {
        try {
          const [gameExists] = await pool.query('SELECT id FROM games WHERE id = ?', [game_id]);
          if (gameExists.length === 0) {
            throw new Error(`Game with id ${game_id} does not exist`);
          }
          const [authorExists] = await pool.query('SELECT id FROM authors WHERE id = ?', [author_id]);
          if (authorExists.length === 0) {
            throw new Error(`Author with id ${author_id} does not exist`);
          }
  
        
          const [result] = await pool.query('INSERT INTO reviews (rating, content, author_id, game_id) VALUES (?, ?, ?, ?)', [rating, content, author_id, game_id]);
          const insertedReviewId = result.insertId;
  
          if (!insertedReviewId) {
            throw new Error('Failed to insert review');
          }
  
          const [insertedReview] = await pool.query('SELECT * FROM reviews WHERE id = ?', [insertedReviewId]);
  
          return insertedReview[0]; 
        } catch (error) {
          throw new Error(`Failed to add review: ${error.message}`);
        }
      }
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
            return rows[0].platform.split(',').map(p => p.trim());
          }
          return []; 
        } catch (error) {
          throw new Error(`Failed to fetch platform for game ${parent.id}: ${error.message}`);
        }
      },
   
    },
      Review: {
        author: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM authors WHERE id = ?', [parent.author_id]);
          return rows[0]; 
        },
        game: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [parent.game_id]);
          return rows[0];
        },
      },
      Author: {
        reviews: async (parent, _, { pool }) => {
          const [rows] = await pool.query('SELECT * FROM reviews WHERE author_id = ?', [parent.id]);
          return rows;
        },
       
      },

  };
  
  export default resolvers;
  