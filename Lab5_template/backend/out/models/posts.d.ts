import mongoose from "mongoose";
export declare const Post: mongoose.Model<{
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    id: false;
}> & {
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    id: false;
}, {
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps, {}, Omit<mongoose.DefaultSchemaOptions, "id" | "timestamps"> & {
    timestamps: true;
    id: false;
}> & {
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, unknown, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
    id: number;
    content: string;
    author?: string | null;
    thread?: number | null;
    parent?: number | null;
    likes: number;
    dislikes: number;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=posts.d.ts.map