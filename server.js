const app = require("./app");

const port = process.env.PORT | 12271;
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
