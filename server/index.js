const express = require('express');
const keys = require('./keys');
const { Pool,Client} = require('pg');
const cors = require('cors');
const { Parser } = require('json2csv');
const csvParse = require('csv-parse/lib/sync');

const pool = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});


let tablesCreated = false;
async function createTables(client) { 

  try {
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS shared_sequence START 1; 
      CREATE TABLE IF NOT EXISTS advertisement (
        imagelink VARCHAR(255),
        targetlink VARCHAR(255),
        counter INT
      );
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        age INT
      );
      CREATE TABLE IF NOT EXISTS trasy (
        id INT DEFAULT NEXTVAL('shared_sequence') PRIMARY KEY,
        date_col DATE,
        hodnota INT,
        typ VARCHAR(100),
        user_id INT
      );
      CREATE TABLE IF NOT EXISTS trvania (
        id INT DEFAULT NEXTVAL('shared_sequence') PRIMARY KEY,
        date_col DATE,
        hodnota INT,
        typ VARCHAR(100),
        user_id INT
      );
      CREATE TABLE IF NOT EXISTS spotreby (
        id INT DEFAULT NEXTVAL('shared_sequence') PRIMARY KEY,
        date_col DATE,
        hodnota INT,
        typ VARCHAR(100),
        user_id INT
      );
      CREATE TABLE IF NOT EXISTS typy (
        id SERIAL PRIMARY KEY,
        nazov VARCHAR(100),
        popis VARCHAR(255)
      );

      INSERT INTO advertisement (imagelink, targetlink, counter) VALUES
      ('https://www.fiit.stuba.sk/buxus/images/cache/stu.full_banner/top_banner/2023/banner-homepage20yearsnew.jpg', 'https://www.fiit.stuba.sk/',0);
      
      
    
      `);

    console.log('Database tables are ready.');
    tablesCreated = true;
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Create tables when the server starts
const app = express();
app.use(cors());
app.use(express.json());
const initializeTables = async () => {
  try {
    const client = await pool.connect();
    console.log('Connecting to the database...');

    // Call createTables and wait for it to complete
    await createTables(client);

    // Release the client back to the pool
    client.release();
    console.log('Connection released.');

    // Start your server after tables are created
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Error initializing tables:', error);
    process.exit(1); // Exit the process if tables cannot be created
  }
};

// Initialize tables when the server starts
initializeTables();


app.get('/jazdy/get', async (req, res) => {
  const userId = req.query.user_id;

  try {
    // Fetch data from multiple tables
    const result = await pool.query(
      `
      SELECT 'trasy' AS table_name, * FROM trasy WHERE user_id = $1
      UNION ALL
      SELECT 'trvania' AS table_name, * FROM trvania WHERE user_id = $1
      UNION ALL
      SELECT 'spotreby' AS table_name, * FROM spotreby WHERE user_id = $1
    `,
      [userId]
    );

    // Send the combined data to the frontend
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, error: 'Error fetching data' });
  }
});
app.post('/jazdy/import', async (req, res) => {
  try {
    if (!req.body || !req.body.csvData || !req.body.user_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
    }

    const { csvData, user_id } = req.body;
    // Truncate tables and restart identity sequences
    await pool.query('DELETE FROM trasy WHERE user_id = $1', [user_id]);
    await pool.query('DELETE FROM trvania WHERE user_id = $1', [user_id]);
    await pool.query('DELETE FROM spotreby WHERE user_id = $1', [user_id]);

    // Parse CSV data using csv-parse library
    const parseOptions = {
      columns: true, // Treat the first row as headers
      skip_empty_lines: true,
    };

    const parsedData = csvParse(csvData, parseOptions);
    // Insert parsed data into the appropriate table based on the table_name field
    await Promise.all(parsedData.map(async (entry) => {
      const query = `INSERT INTO ${entry.table_name} (date_col, hodnota, typ, user_id) VALUES ($1, $2, $3, $4) RETURNING id`;
      const result = await pool.query(query, [entry.date_col, entry.hodnota, entry.typ, user_id]);
    }));

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: 'Error importing data' });
  }
});

app.get('/jazdy/export', async (req, res) => {
  const userId = req.query.user_id;
  try {
    const result = await pool.query(
      `
      SELECT 'trasy' AS table_name, * FROM trasy WHERE user_id = $1
      UNION ALL
      SELECT 'trvania' AS table_name, * FROM trvania WHERE user_id = $1
      UNION ALL
      SELECT 'spotreby' AS table_name, * FROM spotreby WHERE user_id = $1
    `,
      [userId]
    );

    const json2csvParser = new Parser({ fields: ['date_col','hodnota','table_name','typ'] });
    const csvData = json2csvParser.parse(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="exported_jazdy.csv"');
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting jazdy:', error);
    res.status(500).json({ success: false, error: 'Error exporting jazdy' });
  }
});

app.post('/jazdy/add', async (req, res) => {
  try {
    const { hodnota, velicina, typ, currentDate, user_id } = req.body;

    const result = await pool.query(
      `INSERT INTO ${velicina} (date_col, hodnota, typ, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [currentDate, hodnota, typ, user_id]
    );

    res.json({ success: true, insertedId: result.rows[0].id });
  } catch (error) {
    console.error('Error in /jazdy/add:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/jazdy/delete/:tableName/:id', async (req, res) => {
  const tableName = req.params.tableName;
  const id = req.params.id;

  try {
    const result = await pool.query('DELETE FROM ' + tableName + ' WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
});


app.get('/typy/get', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM typy');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching typy:', error);
    res.status(500).json({ success: false, error: 'Error fetching typy' });
  }
});

app.post('/typy/add', async (req, res) => {
  const { nazov, popis } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO typy (nazov, popis) VALUES ($1, $2) RETURNING id', // Assuming the primary key is 'id'
      [nazov, popis]
    );

    const typId = result.rows[0].id;
    res.json({ success: true, typId });
  } catch (error) {
    console.error('Error adding typy:', error);
    res.status(500).json({ success: false, error: 'Error adding typy' });
  }
});

app.delete('/typy/delete/:typId', async (req, res) => {
  const typId = req.params.typId;

  try {
    const result = await pool.query('DELETE FROM typy WHERE id = $1 RETURNING *', [typId]);

    if (result.rows.length > 0) {
      const deletedTyp = result.rows[0];
      res.json({ success: true, deletedTyp });
    } else {
      res.status(404).json({ success: false, error: 'Typ not found' });
    }
  } catch (error) {
    console.error('Error deleting typ:', error);
    res.status(500).json({ success: false, error: 'Error deleting typ' });
  }
});

app.get('/advertisement/get', async (req, res) => {
  const result = await pool.query('SELECT * FROM advertisement');
  res.send(result.rows);
});

app.post('/users/register', async (req, res) => {
  const { name, email, password, age } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING user_id',
  [name, email, password, age]);
  const userId = result.rows[0].user_id;
    res.send({ success: true, userId });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Error registering user' });
  }
});

app.post('/users/login', async (req, res) => {

  const { email, password } = req.body;
  if(email === "admin" && password === "admin"){
    res.json({ success: true, id: "admin" });
  }
  else{
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      if (user.password === password) {
        res.json({ success: true, id: user.user_id });
      } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
      }
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ success: false, error: 'Error authenticating user' });
  }
}})
;
app.get('/users/get', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.send(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
});

app.delete('/users/delete/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userId]);

    if (result.rows.length > 0) {
      const deletedUser = result.rows[0];
      res.json({ success: true, deletedUser });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Error deleting user' });
  }
});

app.put('/advertisement/update', async (req, res) => {
  const { imagelink, targetlink } = req.body;

  try {
    await pool.query('UPDATE advertisement SET imagelink = $1, targetlink = $2', [imagelink, targetlink]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ success: false, error: 'Error updating advertisement' });
  }
});

app.put("/advertisement/increase-counter" , async (req, res) => {
  try {
    await pool.query('UPDATE advertisement SET counter = counter + 1');
    
    res.json({ success: true, message: "Counter increased successfully" });
  } catch (error) {
    console.error('Error increasing counter:', error);
    res.status(500).json({ success: false, error: 'Error increasing counter' });
  }
});

app.get("/advertisement/counter", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM advertisement');
    
    const counterValue = result.rows[0].counter;
    console.log("getting " + counterValue);
    
    res.json({ success: true, counter: counterValue });
  } catch (error) {
    console.error('Error fetching counter:', error);
    res.status(500).json({ success: false, error: 'Error fetching counter' });
  }
});
app.get('/users/export', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');

    // Convert the query result to CSV using json2csv library
    const json2csvParser = new Parser({ fields: ['email','name','password','age'] });
    const csvData = json2csvParser.parse(result.rows);

    // Set response headers to trigger download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="exported_users.csv"');

    // Send the CSV data to the client
    res.send(csvData);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ success: false, error: 'Error exporting users' });
  }
});
app.post('/users/import', async (req, res) => {
  try {
    if (!req.body || !req.body.csvData) {
      return res.status(400).json({ success: false, error: 'No CSV data provided' });
    }

    const csvData = req.body.csvData;
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY');
    // Parse CSV data using csv-parse library
    const parseOptions = {
      columns: true, // Treat the first row as headers
      skip_empty_lines: true,
    };

    const parsedData = csvParse(csvData, parseOptions);
    console.log(parsedData);
    // Insert the users into the PostgreSQL database
    const query = 'INSERT INTO users(name, email, password, age) VALUES($1, $2, $3, $4)';
    await Promise.all(parsedData.map(user => pool.query(query, [ user.name, user.email, user.password, user.age])));

    res.json({ success: true, message: 'Users imported successfully' });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ success: false, error: 'Error importing users' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
