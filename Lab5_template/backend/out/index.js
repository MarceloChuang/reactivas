// P2
import "dotenv/config";
import express, {} from "express";
import { Post } from "./models/posts.js";
import { profileEnd } from "node:console";
const app = express();
app.use(express.json());
app.use(express.static("dist"));
const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};
app.use(requestLogger);
app.get("/api/threads", (request, response, next) => {
    Post.find({ thread: null }).then((threads) => {
        response.json(threads);
    }).catch((error) => next(error));
});
app.post("/api/threads", (request, response, next) => {
    const body = request.body;
    if (!body.content) {
        response.status(400).json({ error: "No hay contenido" });
        return;
    }
    Post.findOne().sort({ id: -1 }).then((lastPost) => {
        const thread = new Post({
            id: lastPost ? lastPost.id + 1 : 1,
            content: body.content,
            author: body.author || null,
            thread: null,
            parent: null,
        });
        return thread.save();
    }).then((savedThread) => {
        response.json(savedThread);
    }).catch((error) => next(error));
});
// P3
app.get("/api/thread/:id", (request, response, next) => {
    const id = Number(request.params.id);
    Post.findOne({ id, thread: null }).then((thread) => {
        if (!thread) {
            response.status(404).end();
            return;
        }
        return Post.find({ thread: id }).then((comments) => {
            response.json({ thread, comments });
        });
    }).catch((error) => next(error));
});
app.post("/api/thread/:id", (request, response, next) => {
    const body = request.body;
    const threadId = request.params.id;
    Post.findOne().sort({ id: -1 }).then((lastPost) => {
        const comment = new Post({
            id: lastPost ? lastPost.id + 1 : 1,
            content: body.content,
            author: body.author || null,
            thread: threadId,
            parent: body.parent || null,
        });
        return comment.save();
    }).then((savedComment) => {
        response.json(savedComment);
    }).catch((error) => next(error));
});
// P5
app.put("/api/posts/:id", (request, response, next) => {
    const id = Number(request.params.id);
    const { content, author, thread, parent, likes, dislikes } = request.body;
    Post.findOne({ id }).then((post) => {
        if (!post) {
            response.status(404).end();
            return;
        }
        post.content = content;
        post.author = author;
        post.thread = thread;
        post.parent = parent;
        post.likes = likes;
        post.dislikes = dislikes;
        return post.save().then((updatedPost) => {
            response.json(updatedPost);
        });
    }).catch((error) => next(error));
});
// P4
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
const errorHandler = (error, request, response, next) => {
    console.error(error.message);
    if (error.name === "ValidationError") {
        response.status(400).json({ error: error.message });
    }
    else if (error.name === "CastError") {
        response.status(400).send({ error: "malformatted id" });
    }
    else
        next(error);
};
app.use(errorHandler);
// P2
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server en puerto ${PORT}`);
});
//# sourceMappingURL=index.js.map