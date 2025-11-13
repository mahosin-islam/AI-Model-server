const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const serviceAccount = require("./ai-model-firebase-key.json");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.port || 4000;

//madel-ware //
dotenv.config();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dream.gcatzqm.mongodb.net/?appName=Dream`;

// Create a MongoClient with  MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// veryfyTooken funtion
const tooken = async (req, res, next) => {
  const authorize = req.headers.authorization;
  console.log(authorize);
  if (!authorize) {
    return res.status(404).send({ message: "not fined your token" });
  }
  const token = authorize.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);

    next();
  } catch (err) {
    res.status(404).send({ message: "not fined your token" });
  }
};

async function run() {
  try {
    // await client.connect();    commit form mongo ---1
    const db = client.db("AI_Model");
    const modelCollection = db.collection("model");
    const purchaseCollection = db.collection("purchase");

    // get API sectin

    app.get("/", (req, res) => {
      res.send("server all runter runign");
    });
    app.get("/model", async (req, res) => {
      const result = await modelCollection.find().toArray();
      res.send(result);
    });


    app.get("/Lates-model", async (req, res) => {
      const result = await modelCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray(); //  asc or desc
      res.send(result);
    });

    app.get("/model/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await modelCollection.findOne(query);
      res.send(result);
    });

    app.get("/myModel", tooken, async (req, res) => {
      const email = req.query.email;
      const result = await modelCollection.find({ createdBy: email }).toArray();
      res.send(result);
    });

    app.get("/purchase", tooken, async (req, res) => {
      const result = await purchaseCollection.find().toArray();
      res.send(result);
    });
    app.get("/purchase/:id", tooken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchaseCollection.findOne(query);
      res.send(result);
    });

    app.get("/myPurchase", tooken, async (req, res) => {
      const email = req.query.email;
      const result = await purchaseCollection
        .find({ purchased_by: email })
        .toArray();
      res.send(result);
    });

    //post model
    app.post("/model", async (req, res) => {
      const query = req.body;
      const result = await modelCollection.insertOne(query);
      res.send(result);
    });
    app.post("/purchase", async (req, res) => {
      const query = req.body;
      const result = await purchaseCollection.insertOne(query);
      res.send(result);
    });

    // delet oparetor
    app.delete("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/model/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await modelCollection.deleteOne(query);
      res.send(result);
    });
    // pathdk mode
    app.patch("/model/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateData = req.body;
      const update = {
        $set: updateData,
      };
      const result = await modelCollection.updateOne(query, update);
      res.send(result);
    });

    app.patch("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const psUpdate = req.body;
      const update = {
        $inc: psUpdate,
      };
      const result = await purchaseCollection.updateOne(query, update);
      res.send(result);
    });

    //search oparaion
    app.get("/search", async (req, res) => {
      const search = req.query.search;
      const result = await modelCollection
        .find({ name: { $regex: search, $options: "i" } })
        .toArray();
      res.send(result);
    });

    app.get("/frameworkd", async (req, res) => {
      const framework = req.query.framework;
      const result = await modelCollection
        .find({ framework: { $regex: framework, $options: "i" } })
        .toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 }); --commit for gongo-3
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});