const express = require("express");
const cors = require("cors");
const app = express();
const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hxpxamt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const collegeCollection = client.db("endGame").collection("college");


     app.get("/colleges",verifyJWT, async (req, res) => {
       const result = await collegeCollection.find().toArray();
       res.send(result);
     });



app.get("/colleges/:id", async (req, res) => {
  try {
    const collegeId = req.params.id;

    // Validate if the ID is a valid ObjectId
    if (!ObjectId.isValid(collegeId)) {
      return res.status(400).send("Invalid college ID");
    }

    const college = await collegeCollection.findOne({
      _id:new ObjectId(collegeId),
    });

    if (!college) {
      return res.status(404).send("College not found");
    }

    res.send(college);
  } catch (error) {
    console.error("Error searching college by ID:", error);
    res.status(500).send("Internal server error");
  }
});


    
app.get("/", (req, res) => {
  res.send("End Game server is running");
});
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

