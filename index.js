const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require("dotenv").config();
const cors = require("cors");


const app = express();
const port = process.env.PORT || 5000;


//MiddleWare
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsmmh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {

        await client.connect();
        const database = client.db('drones');
        const dronesCollection = database.collection('purchases');
        const usersCollection = database.collection('users');

        // GET API
        app.get('/purchases', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = dronesCollection.find(query);
            const purchases = await cursor.toArray();
            res.send(purchases);
        });

        app.get('/purchases', async (req, res) => {
            const cursor = dronesCollection.find({});
            const purchases = await cursor.toArray();
            res.send(purchases);
        });
        //GET Single purchase
        app.get('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific offer', id);
            const query = { _id: ObjectId(id) };
            const purchase = await dronesCollection.findOne(query);
            res.json(purchase);
        });

        app.post('/purchases', async (req, res) => {
            const purchase = req.body;
            console.log('hit the post api', purchase);
            const result = await dronesCollection.insertOne(purchase);
            res.json(result);

        });

        // users
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

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);

        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('hit the admin', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        
        // DELETE API
        app.delete('/purchases/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await dronesCollection.deleteOne(query);
            res.json(result);
        });


    }
    finally {
    // await client.close();
    }


}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('welcome to self project node');
});

app.listen(port, () => {
    console.log('Listening to port', port);
});




// nicheDrone
// 1Zyj8u13fHjZR1Qp