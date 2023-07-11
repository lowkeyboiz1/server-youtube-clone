import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  uid: {
    require: true,
    type: String,
  },
  videosHaveSeened: {
    type: String,
  },
  liked: [
    {
      videoId: {
        type: String,
      },
      itemLike: {
        type: Object,
      },
    },
  ],
  disLiked: [
    {
      videoId: {
        type: String,
      },
      itemLike: {
        type: Object,
      },
    },
  ],
  subscribeChannles: [
    {
      channleId: {
        type: String,
      },
      itemChannle: {
        type: Object,
      },
      subscribed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  listSeen: [
    {
      type: Object,
    },
  ],
  channles: {
    type: Schema.Types.ObjectId,
    ref: "Channels",
  },
});

export const Users = mongoose.model("users", UsersSchema);
