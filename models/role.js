const { model, Schema } = require("mongoose");

const rolesSchema = new Schema({
  username: String,
  rolesname: String,
  createdAt: String,
});

module.exports = model("Role", rolesSchema);
