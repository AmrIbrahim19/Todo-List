const express = require('express');
const { v4: generateId } = require('uuid');
const database = require('./database');

const app = express();

function requestLogger(req, res, next) {
  res.once('finish', () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push('->', res.statusCode);
  });
  next();
}

app.use(requestLogger);
app.use(require('cors')());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  const todos = database.client.db('todos').collection('todos');
  try {
    const response = await todos.find({}).sort({ index: 1 })
      .toArray();
    res.status(200);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.post('/', async (req, res) => {
  const { text, index } = req.body;

  if (typeof text !== 'string') {
    res.status(400);
    res.json({ message: "invalid 'text' expected string" });
    return;
  }

  const todo = {
    id: generateId(), index, text, completed: false, dueDate: '',
  };
  await database.client.db('todos').collection('todos').insertOne(todo);
  res.status(201);
  res.json(todo);
});

app.get('/today', async (req, res) => {
  const { date } = req.query;
  const todos = database.client.db('todos').collection('todos');
  try {
    const todayTodos = await todos.find({
      dueDate: date,
    }).toArray();
    res.status(200);
    res.json(todayTodos);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

app.put('/sort/index', async (req, res) => {
  const { source, destination } = req.body;
  if (source === destination) {
    return res.status(400).json({ message: 'invalid request' });
  }
  if (source > destination) {
    await database.client.db('todos').collection('todos')
      .updateOne({ index: { $eq: source } }, { $set: { index: -2 } });
    await database.client.db('todos').collection('todos')
      .updateMany({ index: { $lt: source, $gte: destination } }, { $inc: { index: 1 } });
    await database.client.db('todos').collection('todos')
      .updateOne({ index: { $eq: -2 } }, { $set: { index: destination } });
  } else if (source < destination) {
    await database.client.db('todos').collection('todos')
      .updateOne({ index: { $eq: source } }, { $set: { index: -2 } });
    await database.client.db('todos').collection('todos')
      .updateMany({ index: { $lte: destination, $gt: source } }, { $inc: { index: -1 } });
    await database.client.db('todos').collection('todos')
      .updateOne({ index: { $eq: -2 } }, { $set: { index: destination } });
  }

  return res.status(200);
});

app.put('/delete/index', async (req, res) => {
  const { deletedIndex } = req.body;

  if (deletedIndex < 0) {
    return res.status(400).json({ message: 'invalid request' });
  }

  await database.client.db('todos').collection('todos')
    .updateMany({ index: { $gt: deletedIndex } }, { $inc: { index: -1 } });

  return res.status(200);
});

app.put('/date/:id', async (req, res) => {
  const { id } = req.params;
  const { date } = req.body;

  if (typeof date !== 'string') {
    res.status(400);
    res.json({ message: "invalid 'date' expected string" });
    return;
  }

  await database.client.db('todos').collection('todos').updateOne({ id },
    { $set: { dueDate: date } });
  res.status(200);
  res.end();
});

app.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    res.status(400);
    res.json({ message: "invalid 'completed' expected boolean" });
    return;
  }

  await database.client.db('todos').collection('todos').updateOne({ id },
    { $set: { completed } });
  res.status(200);
  res.end();
});

app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await database.client.db('todos').collection('todos').deleteOne({ id });
  res.status(203);
  res.end();
});

module.exports = app;
