import mongoose from "mongoose";

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI?.trim();
    if (!mongoUri) {
        throw new Error("MONGODB_URI is missing. Set it in Render environment variables.");
    }

    // Disable model operation buffering so DB failures surface immediately.
    mongoose.set("bufferCommands", false);

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB runtime error:", err?.message || err);
    });

    mongoose.connection.on("disconnected", () => {
        console.error("MongoDB disconnected");
    });

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully");
}

export default connectDB;
