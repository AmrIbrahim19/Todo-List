const { MongoClient } = require('mongodb');

const database = module.exports;

database.connect = async function connect() {
  database.client = await MongoClient.connect('mongodb+srv://amr:amr1234@cluster0.uh39d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true });
};
