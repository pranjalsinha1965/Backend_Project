require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3002;

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://prs_16:KTh49#4gBip$@cluster0.ch2tilx.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString);
mongoose.set('strictQuery', false);

const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});

app.use(cors());
app.use(express.json());

const routes = require('./routes/routes');

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
