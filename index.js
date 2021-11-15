const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kq3to.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("dhoom");
        const reviewsCollection = database.collection("reviews");
        const bikesCollection = database.collection("bikes");
        const allOrdersCollection = database.collection("allOrders");
        const usersCollection = database.collection("users");


        // USERS API HANDLING //


        // POSTING USER
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        // CHECKING ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        // MAKING USER ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email, password: user.password };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //////////////////////////////////


        // BIKES API HANDLING //


        // GETTING BIKES DATA
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })
        // GETTING SINGLE bike DATA
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bikes = await bikesCollection.findOne(query);
            res.send(bikes);
        })
        // POST BIKE DATA
        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await bikesCollection.insertOne(bike);
            res.json(result);
        })
        // DELETING BIKE DATA
        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            res.json(result);
        })

        /////////////////////////////////


        // REVIEW API HANDLING //


        // GETTING REVIEW DATA
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // ADDIND REVIEW DATA
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })
        //////////////////////////////////


        // ALL ORDERS API HANDLING //


        // GETTING ORDERS
        app.get('/allOrders', async (req, res) => {
            const cursor = allOrdersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);
        })

        // POSTING ORDERS
        app.post('/allOrders', async (req, res) => {
            const allOrders = req.body;
            const result = await allOrdersCollection.insertOne(allOrders);
            res.json(result);
        })
        // UPDATING ALL ORDERS
        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedAllOrders = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedAllOrders.status,
                },
            };
            const result = await allOrdersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        // DELETING AN ORDER
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await allOrdersCollection.deleteOne(query);
            res.json(result);
        })

        ///////////////////////////////////////
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hurray! Server is on');
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})