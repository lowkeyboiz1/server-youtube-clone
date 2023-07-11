import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChannelsSchema = new Schema({
  videosHaveSeened: {
    type: String,
  },
  liked: [
    {
      type: String,
    },
  ],
  subscribeChannles: [
    {
      type: String,
    },
  ],
});

export const Channels = mongoose.model("channels", ChannelsSchema);
