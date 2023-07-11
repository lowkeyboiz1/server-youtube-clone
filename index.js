import express from "express";
import mongoose, { syncIndexes } from "mongoose";
import { Videos } from "./models/Videos.js";
import { Users } from "./models/Users.js";
import { Channels } from "./models/Channels.js";
import { VideoLike } from "./models/VideoLike.js";
import { SubscribeChannle } from "./models/SubscribeChannle.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 4000;

const uri = `mongodb+srv://admin123:admin123@youtube.7taimlv.mongodb.net/db`;
const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("success");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

connectDB();

app.use(express.json());
app.use(cors());

function getRandomView() {
  return Math.floor(Math.random() * 999) + 1 + " N";
}

// get data form mongodb
app.get("/", async (req, res) => {
  const category = req.query.category;
  const limit = parseInt(req.query.limit) || 9;
  const offset = parseInt(req.query.offset) || 0;

  let videos;

  if (category) {
    if (category.length > 0 && category !== "Tất cả") {
      videos = await Videos.find({ category: category })
        .skip(offset)
        .limit(limit);
    } else {
      videos = await Videos.find().skip(offset).limit(limit);
    }
  } else {
    videos = await Videos.find().skip(offset).limit(limit);
  }

  res.json({
    success: true,
    message: `Get data with category [${category ? category : "Tất cả"}]`,
    videos,
  });
});

//hàm thêm video
// app.post("/", async (req, res) => {
//   const dataVideo = req.body;
//   const newVideos = new Videos(dataVideo);
//   await newVideos.save();
//   return res.json({
//     success: true,
//     message: "add video successfully!",
//     dataVideo,
//   });
// });

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

// search
app.get("/search/:key", async (req, res) => {
  const keySearch = removeVietnameseTones(req.params.key);
  try {
    let result = await Videos.find({
      $or: [
        {
          textSearch: {
            $regex: keySearch,
            $options: "i",
          },
        },
        {
          categoryTextSearch: {
            $regex: keySearch,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      result: result,
      noVietNam: keySearch,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Lỗi server");
  }
});

//add user
app.post("/auth/users", async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await Users.findOneAndUpdate(
      { uid: uid },
      { uid: uid },
      { upsert: true, new: true }
    );

    if (user) {
      res.json({ message: "User already exists", user });
    } else {
      res.json({ message: "User added successfully", user });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// get data of channles subscribe
app.post("/user/info", async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await Users.findOne({ uid: uid });

    const Channles = user.subscribeChannles;
    if (Channles.length > 0) {
      const videos = await Videos.aggregate([
        { $match: { channelId: { $in: Channles } } },
        { $sort: { channelId: 1, createdAt: -1 } },
        {
          $group: {
            _id: "$channelId",
            video: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$video" } },
      ]);

      return res.json({
        success: true,
        message: "Videos retrieved successfully",
        videos: videos,
      });
    } else {
      return res.json({
        success: true,
        message: "No subscribed channels found",
        videos: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving videos",
    });
  }
});

// get data detailchannle by idChannle

// localhost:4000/detailChannle/kkkk => req.params.id === kkk
app.get("/detailChannle/:id", async (req, res) => {
  const idChannle = req.params.id;
  try {
    const videos = await Videos.find({ channelId: idChannle });
    if (videos.length > 0) {
      res.json({ success: true, message: "Happy!", videos });
    } else {
      res.json({ success: false, message: "No video match" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving videos",
    });
  }
});

app.post("/user/listSeen", async (req, res) => {
  const { uid, data } = req.body;

  try {
    const user = await Users.findOne({ uid: uid });

    if (user) {
      const index = user.listSeen.findIndex(
        (item) => item.channelId === data.channelId
      );

      if (index === -1) {
        user.listSeen.unshift(data);
      } else {
        user.listSeen.splice(index, 1);
        user.listSeen.unshift(data);
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Dữ liệu đã được cập nhật",
        user: updatedUser,
      });
    } else {
      res.json({ success: false, message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.json({ success: false, message: "Đã xảy ra lỗi khi cập nhật dữ liệu" });
  }
});

// {
//   "uid": "j6yoJTJTkmUSvX8ERnbSHRubOX32",
//   "channleId": "123",
//   "itemChannle":
//       {
//           "id": 2
//       }

// }

// subscribe and unSubscribe
app.post("/user/subscribe", async (req, res) => {
  const { uid, channleId, itemChannle } = req.body;
  try {
    let user = await Users.findOne({ uid: uid });

    if (user) {
      // Check if the channleId already exists in the subscribeChannles array
      const subscribedChannel = user.subscribeChannles.find(
        (channel) => channel.channleId === channleId
      );

      if (subscribedChannel) {
        // If already subscribed, remove the channleId from the array
        user.subscribeChannles = user.subscribeChannles.filter(
          (channel) => channel.channleId !== channleId
        );
        await user.save();
        res.json({ message: "Unsubscribed", user });
      } else {
        // If not subscribed, add the channleId, itemChannle, and subscribed field to the array
        user.subscribeChannles.push({
          channleId,
          itemChannle,
          subscribed: true,
        });
        await user.save();
        res.json({ message: "Subscribed", user });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// lấy kênh đăng ký
app.get("/user/subscriptions/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await Users.findOne({ uid });

    if (user) {
      const subscriptions = user.subscribeChannles;
      res.json({ subscriptions });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// lấy video đã like
app.get("/user/liked/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await Users.findOne({ uid });

    if (user) {
      const likedVideos = user.liked;
      res.json({ likedVideos });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//Like and UnLike

// {
//   "uid": "j6yoJTJTkmUSvX8ERnbSHRubOX32",
//   "videoId": "khang",
//   "itemLike":
//       {
//           "id": 3
//       }

// }

app.post("/user/like", async (req, res) => {
  const { uid, videoId, itemLike } = req.body;
  try {
    let user = await Users.findOne({ uid: uid });

    if (user) {
      // Check if the videoId already exists in the liked array
      const likedVideo = user.liked.find((like) => like.videoId === videoId);

      if (likedVideo) {
        // If already liked, remove   the videoId from the array
        user.liked = user.liked.filter((like) => like.videoId !== videoId);
        await user.save();
        res.json({ message: "Video unliked", user: likedVideo });
      } else {
        // If not liked, add the videoId and itemLike to the array
        const newLike = { videoId, itemLike };
        user.liked.push(newLike);
        await user.save();
        res.json({ message: "Video liked", user: newLike });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// check itemVideo have like yet
app.get("/user/liked/:uid/:videoId", async (req, res) => {
  const { uid, videoId } = req.params;
  try {
    const user = await Users.findOne({ uid });

    if (user) {
      const likedVideo = user.liked.find((like) => like.videoId === videoId);
      const isLiked = likedVideo ? true : false;

      res.json({ isLiked });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// check channle have subscribe yet
app.get("/user/subscribed/:uid/:channleId", async (req, res) => {
  const { uid, channleId } = req.params;
  try {
    const user = await Users.findOne({ uid });

    if (user) {
      const subscribedChannel = user.subscribeChannles.find(
        (channel) => channel.channleId === channleId
      );
      const isSubscribed = subscribedChannel ? true : false;

      res.json({ isSubscribed });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// lấy ra các video thuộc kênh đăng ký
app.get("/user/videos/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await Users.findOne({ uid });
    const subscribedChannels = user.subscribeChannles;

    // Lấy danh sách channleId từ mảng subscribedChannels
    const channelIds = subscribedChannels.map((channel) => channel.channleId);

    // Lấy danh sách video dựa trên channleIds
    const videos = await Videos.find({ channelId: { $in: channelIds } });

    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

// viết api để lấy dữ liêu đổ vào watch
app.post("/api/videos", async (req, res) => {
  const { videoId } = req.body;

  // Tìm video trong danh sách dựa trên videoId
  const selectedVideo = await Videos.find({ videoId: videoId });

  if (selectedVideo) {
    // Nếu tìm thấy video, trả về dữ liệu video tương ứng
    res.json({ success: true, video: selectedVideo });
  } else {
    // Nếu không tìm thấy video, trả về thông báo lỗi
    res.json({ success: false, message: "Không tìm thấy video" });
  }
});

// this route is get video and videoId
app.get("/videos/:videoId", async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Videos.findOne({ videoId });
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

//like unlike dislike and undislike
app.post("/user/action", async (req, res) => {
  const { uid, videoId, itemLike, action } = req.body;
  try {
    let user = await Users.findOne({ uid: uid });

    if (user) {
      // Check if the videoId already exists in the liked array
      const likedVideo = user.liked.find((like) => like.videoId === videoId);
      const dislikedVideo = user.disLiked.find(
        (dislike) => dislike.videoId === videoId
      );

      if (action === "like") {
        if (likedVideo) {
          // If already liked, remove the videoId from the array
          user.liked = user.liked.filter((like) => like.videoId !== videoId);
          await user.save();
          res.json({ message: "Video unliked", user: likedVideo });
        } else {
          // If not liked, add the videoId and itemLike to the array
          const newLike = { videoId, itemLike };
          user.liked.push(newLike);
          await user.save();

          // Check if the videoId exists in the disLiked array
          if (dislikedVideo) {
            // If exists, remove the videoId from the array
            user.disLiked = user.disLiked.filter(
              (dislike) => dislike.videoId !== videoId
            );
            await user.save();
          }

          res.json({ message: "Video liked", user: newLike });
        }
      } else if (action === "dislike") {
        if (dislikedVideo) {
          // If already disliked, remove the videoId from the array
          user.disLiked = user.disLiked.filter(
            (dislike) => dislike.videoId !== videoId
          );
          await user.save();
          res.json({ message: "Video undisliked", user: dislikedVideo });
        } else {
          // If not disliked, add the videoId and itemLike to the array
          const newDislike = { videoId, itemLike };
          user.disLiked.push(newDislike);
          await user.save();

          // Check if the videoId exists in the liked array
          if (likedVideo) {
            // If exists, remove the videoId from the array
            user.liked = user.liked.filter((like) => like.videoId !== videoId);
            await user.save();
          }

          res.json({ message: "Video disliked", user: newDislike });
        }
      } else {
        res.status(400).json({ error: "Invalid action" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/videos/:uid/:videoId/status", async (req, res) => {
  const { uid, videoId } = req.params;
  try {
    let user = await Users.findOne({ uid: uid });

    if (user) {
      const likedVideo = user.liked.find((like) => like.videoId === videoId);
      const dislikedVideo = user.disLiked.find(
        (dislike) => dislike.videoId === videoId
      );

      if (likedVideo) {
        res.json({ status: "like", message: "Video is liked" });
      } else if (dislikedVideo) {
        res.json({ status: "dislike", message: "Video is disliked" });
      } else {
        res.json({ status: "custom", message: "Custom status message" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/video/:id/info", async (req, res) => {
  const { id } = req.params;

  try {
    let video = await Videos.findOne({ videoId: id });
    if (video) {
      res.status(200).json({ success: true, message: "Happy!", video });
    } else {
      res.status(400).json({
        success: false,
        message: `Don't have this video with id ${id}`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
