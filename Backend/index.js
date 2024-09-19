const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json(), express.urlencoded({ extended: true }));
dotenv.config({
  path: ".env",
});

const corsOption = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOption));

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database is connected");
  } catch (error) {
    console.error("Database connection error", error);
    process.exit(1);
  }
};
main();

const schema = new mongoose.Schema({
  reminderMsg: String,
  remindAt: String,
  isReminded: Boolean,
});

const Reminder = mongoose.model("Reminder", schema);

setInterval(async () => {
    try {
      const reminderList = await Reminder.find({});
      if (reminderList) {
        reminderList.forEach(async (reminder) => {
          if (!reminder.isReminded) {
            const now = new Date();
            if (new Date(reminder.remindAt) - now < 0) {
              try {
                await Reminder.findByIdAndUpdate(reminder._id, { isReminded: true });
                const accountSid = process.env.ACCOUNT_SID;
                const authToken = process.env.AUTH_TOKEN;
                const client = require("twilio")(accountSid, authToken);
                client.messages
                  .create({
                    body: reminder.reminderMsg,
                    from: "whatsapp:+14155238886",
                    to: "whatsapp:+918126492389",
                  })
                  .then((message) => console.log(message.sid))
                  .catch((error) => console.error(error));
              } catch (error) {
                console.error(error);
              }
            }
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, 1000);

app.get("/", async (req, res) => {
  res.send("hii this is get");
});

app.get("/getAllReminder", async (req, res) => {
  try {
    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (error) {
    res.status(401).json({
      message: "Nothing is found",
      success: false,
    });
  }
});

app.post("/addReminder", async (req, res) => {
  const { reminderMsg, remindAt } = req.body;
  if (!reminderMsg || !remindAt) {
    return res.status(401).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    await Reminder.create({
      reminderMsg,
      remindAt,
      isReminded: false,
    });

    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create reminder",
      success: false,
    });
  }
});

app.post("/deleteReminder", async (req, res) => {
  try {
    await Reminder.deleteOne({ _id: req.body.id });
    const reminderList = await Reminder.find({});
    res.send(reminderList);
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete reminder",
      success: false,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
