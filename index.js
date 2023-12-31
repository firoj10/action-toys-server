const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();


const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4gqmum7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
  
    await client.connect();
    const toyCollection = client.db('actionToyDB').collection('actionToy');



    app.get('/actionToy', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result)

    })
    app.get('/maleToy', async (req, res) => {
      const query = { subcategoris: 'male-hero' }
      const cursor = toyCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)

    })
    app.get('/femaleToy', async (req, res) => {
      const query = { subcategoris: 'female-hero' }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)

    })
    app.get('/childrenToy', async (req, res) => {
      const query = { subcategoris: 'children-hero' }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)

    })
    app.get('/actionToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result)

    })

    app.get('/myToy/:email', async (req, res) => {
      const order = req.query.order === 'asc' ? 1 : -1;
      const jobs = await toyCollection
        .find({
          selleremail: req.params.email,
        }).sort({ price: order })
        .toArray();
      res.send(jobs);

    });

    const indexkeys = { name: 1 };
    const indexOptions = { name: "toyName" };
    const result = await toyCollection.createIndex(indexkeys, indexOptions)
    app.get("/toySearchByName/:name", async (req, res) => {
      const searchText = req.params.name;

      const result = await toyCollection
        .find({ name: { $regex: searchText, $options: "i" } })
        .toArray()
      res.send(result)

    })

    app.post('/actionToy', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result)

    })


    app.put('/actionToy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateToy = req.body;
      const toy = {
        $set: {
          name: updateToy.name,
          sellername: updateToy.sellername,
          selleremail: updateToy.selleremail,
          subcategoris: updateToy.subcategoris,
          price: updateToy.price,
          rating: updateToy.rating,
          availablequantity: updateToy.availablequantity,
          detaildescription: updateToy.detaildescription,
          photo: updateToy.photo,
        }

      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result)

    })
    app.delete('/actionToy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('super toys server is running')
})

app.listen(port, () => {
  console.log(` super toys server running on port ${port}`)
})