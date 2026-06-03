const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());

// ---------------- MongoDB ----------------

const uri = process.env.MONGODB_URI;

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
    const db = client.db("portfolioDB");

    const skillsCollection = db.collection("skills");
    const projectsCollection = db.collection("projects");
    const profileCollection = db.collection("profile");
    const experiencesCollection = db.collection("experiences");

    // ADMIN LOGIN
    // =====================

    app.post("/api/admin/login", async (req, res) => {
      const { password } = req.body;

      if (password === "devjoynul@2026") {
        return res.send({
          success: true,
          token: "admin-token",
        });
      }

      res.status(401).send({
        success: false,
        message: "Invalid password",
      });
    });

    // =====================
    // SKILLS
    // =====================

    app.get("/api/skills", async (req, res) => {
      const result = await skillsCollection.find().toArray();
      res.send(result);
    });

    app.post("/api/skills", async (req, res) => {
      const skill = req.body;

      const result = await skillsCollection.insertOne(skill);

      res.send({
        success: true,
        insertedId: result.insertedId,
      });
    });

    app.delete("/api/skills/:id", async (req, res) => {
      const id = req.params.id;

      const result = await skillsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });



    // =====================
    // PROJECTS
    // =====================

    app.get("/api/projects", async (req, res) => {
      const result = await projectsCollection.find().toArray();
      res.send(result);
    });

    app.post("/api/projects", async (req, res) => {
      const project = req.body;

      const result = await projectsCollection.insertOne(project);

      res.send({
        success: true,
        insertedId: result.insertedId,
      });
    });

    app.put("/api/projects/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await projectsCollection.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: updatedData,
        }
      );

      res.send(result);
    });

    app.delete("/api/projects/:id", async (req, res) => {
      const id = req.params.id;

      const result = await projectsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    // =====================
    // PROFILE / ABOUT
    // =====================

    app.get("/api/profile", async (req, res) => {
      const result = await profileCollection.findOne({});

      if (!result) {
        return res.send({
          title: "",
          description1: "",
          description2: "",
          experience: "",
          projects: "",
        });
      }

      res.send(result);
    });

    app.put("/api/profile", async (req, res) => {
      const profileData = req.body;

      const result = await profileCollection.updateOne(
        {},
        {
          $set: profileData,
        },
        {
          upsert: true,
        }
      );

      res.send(result);
    });



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);


// ---------------- basic route ----------------
app.get("/", (req, res) => {
  res.send("Portfolio server is running...");
});

module.exports = app;

// ---------------- start server ----------------
// app.listen(PORT, () => {
//   console.log(`Server running on port:${PORT}`);
// });