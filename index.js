const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// URI

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7o1h45b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// For coffe
		const coffeeCollection = client.db("coffeDB").collection("coffee");

		// For coffe website users
		const usersCollection = client.db("coffeDB").collection("users");

		// Connect the client to the serverS
		await client.connect();

		app.get("/coffee", async (req, res) => {
			const result = await coffeeCollection.find().toArray();
			res.send(result);
		});

		app.get("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.findOne(query);
			res.send(result);
		});

		app.post("/coffee", async (req, res) => {
			const newCoffee = req.body;
			const result = await coffeeCollection.insertOne(newCoffee);
			res.send(result);
		});

		app.delete("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await coffeeCollection.deleteOne(query);
			res.send(result);
		});

		app.put("/coffee/:id", async (req, res) => {
			const id = req.params.id;
			const updatedCoffee = req.body;
			const filter = { _id: new ObjectId(id) };
			const options = { upsert: true };
			const updatedCoffeeDoc = {
				$set: {
					name: updatedCoffee.name,
					quantity: updatedCoffee.quantity,
					supplier: updatedCoffee.supplier,
					taste: updatedCoffee.taste,
					category: updatedCoffee.category,
					details: updatedCoffee.details,
					photo: updatedCoffee.photo,
				},
			};

			const result = await coffeeCollection.updateOne(
				filter,
				updatedCoffeeDoc,
				options
			);

			res.send(result);
		});

		// Users collection realated api

		app.get("/users", async (req, res) => {
			const users = await usersCollection.find().toArray();
			res.send(users);
		});

		app.post("/users", async (req, res) => {
			const newUser = req.body;
			const user = await usersCollection.insertOne(newUser);
			res.send(user);
		});

		app.delete("/users/:id", async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const result = await usersCollection.deleteOne(filter);
			res.send(result);
		});

		app.patch("/users", async (req, res) => {
			const user = req.body;
			// Filter by email
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					lastSignIn: user.lastSignIn,
				},
			};
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
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

app.get("/", (req, res) => {
	res.send("My coffee maker server is running");
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
