import mongoose from "mongoose";

const Schema = mongoose.Schema;

const VideoLikeSchema = new Schema({
  uid: {
    require: true,
    type: String,
  },
  videoId: {
    type: String,
  },
  videoLikeItem: {
    type: Object,
  },
});

export const VideoLike = mongoose.model("videoLike", VideoLikeSchema);
