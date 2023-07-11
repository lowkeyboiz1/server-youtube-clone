import mongoose from "mongoose";

const Schema = mongoose.Schema;

const VideosSchema = new Schema({
  category: {
    type: String,
  },
  VideoTitle: {
    type: String,
  },
  publishTime: {
    type: Date,
  },
  videoId: {
    type: String,
  },
  description: {
    type: String,
  },
  channelTitle: {
    type: String,
  },
  urlChannel: {
    type: String,
  },
  channelId: {
    type: String,
  },
  urlThumbnail: {
    type: String,
  },
  view: {
    type: String,
  },
  like: {
    type: String,
  },
  subscriber: {
    type: String,
  },
  textSearch: {
    type: String,
  },
  channles: {
    type: Schema.Types.ObjectId,
    ref: "Channels",
  },
});

export const Videos = mongoose.model("videos", VideosSchema);
