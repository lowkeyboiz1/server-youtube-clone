import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SubscribeChannleSchema = new Schema({
  uid: {
    require: true,
    type: String,
  },
  channleId: {
    type: String,
  },
  SubscribeChannleItem: {
    type: Object,
  },
});

export const SubscribeChannle = mongoose.model(
  "subscribeItem",
  SubscribeChannleSchema
);
