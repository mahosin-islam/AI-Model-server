const express =require('express')
const cors =require('cors')
const app=express()
 const dotenv = require('dotenv')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.port || 4000;

//madel-ware
dotenv.config();
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@dream.gcatzqm.mongodb.net/?appName=Dream`;

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
       const db =client.db("AI_Model")
       const modelCollection=db.collection("model")
       const purchaseCollection = db.collection("purchase")

// get API 

app.get('/', (req, res)=>{
    res.send('server is running')
}) 
       app.get('/model',async(req, res)=>{
        const result= await modelCollection.find().toArray()
        res.send(result)
       })

       app.get("/Lates-model",async(req,res)=>{
        const result = await modelCollection.find().sort({createdAt: 'asc'}).limit(6).toArray()  ////asc or desc
        res.send(result)
       })
     app.get("/model/:id",async(req,res)=>{
       const id= req.params.id;
       const query ={_id: new ObjectId(id)}
       const result =await modelCollection.findOne(query)
       res.send(result)
     })

     app.get("/myModel",async(req,res)=>{
      const email =req.query.email;
      const result=await modelCollection.find({createdBy: email}).toArray()
      res.send(result)

     })

  app.get("/purchase",async(req,res)=>{
    const result =await purchaseCollection.find().toArray()
    res.send(result)
  })

  app.get("/myPurchase",async(req,res)=>{
      const email =req.query.email;
      const result=await purchaseCollection.find({createdBy: email}).toArray()
      res.send(result)

     })


//post model
app.post("/model",async(req, res)=>{
   const query = req.body;
   const result =await modelCollection.insertOne(query)
   res.send(result)
})
app.post("/purchase",async(req,res)=>{
  const query = req.body;
  const result =await purchaseCollection.insertOne(query)
  res.send(result)
})

// delet oparetor
app.delete("/purchase/:id",async(req,res)=>{
  const id =req.params.id
  const query ={_id: new ObjectId(id)}
  const result = await purchaseCollection.deleteOne(query)
  res.send(result)
})

app.delete("/model/:id", async(req,res)=>{
  const id =req.params.id;
  const query ={_id: new ObjectId(id)}
  const result =await modelCollection.deleteOne(query)
  res.send(result)
})
// pathdk mode
app.patch("/model/:id",async(req,res)=>{
    const id= req.params.id;
    const query ={_id: new ObjectId(id)}
    const updateData =req.body;
    const update={
      $set: updateData,
    }
    const result =await modelCollection.updateOne(query, update)
    res.send(result)
})

app.patch("/purchase/:id", async(req, res)=>{
  const id =req.params.id;
  const query ={_id: new ObjectId(id)}
  const psUpdate=req.body;
  const update={
    $inc: psUpdate,
  }
  const result =await purchaseCollection.updateOne(query, update)
  res.send(result)
})







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})