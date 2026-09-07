// P1
import mongoose from "mongoose";
const url = process.env.MONGODB_URI;
mongoose.set("strictQuery", false);
mongoose.connect(url || "mongodb://127.0.0.1:27017/pilacompleta").catch((error) => {
    console.log("No se pudo conectar a mongo", error.message);
});
const ForbiddenNames = ["huevito rey", "matías toro", "memes es mal ramo"];
const postSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 300,
    },
    author: {
        type: String,
        default: null,
        validate: {
            validator: (value) => {
                if (!value)
                    return true;
                return !ForbiddenNames.includes(value.trim().toLowerCase());
            },
            message: "No se permite el nombre",
        },
    },
    thread: { type: Number, default: null },
    parent: { type: Number, default: null },
    likes: { type: Number, default: 0, min: 0 },
    dislikes: { type: Number, default: 0, min: 0 },
}, { timestamps: true, id: false });
postSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});
export const Post = mongoose.model("Post", postSchema);
//# sourceMappingURL=posts.js.map