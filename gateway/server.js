require("dotenv").config();

const app = require("./src/app");

const port = Number(process.env.PORT || 4000);
const PORT = port;

app.listen(port, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
});
