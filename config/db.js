const mongoose = require("mongoose");

mongoose
  .connect(`mongodb+srv://${process.env.USER_DB_PASS}@cluster0.pta8j.mongodb.net/family-network?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Fail to connect to MongoDB ==>", err));
