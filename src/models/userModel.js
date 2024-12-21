import { Schema, model } from "mongoose";

// basic user schema due to limited time
const UserSchema = new Schema({
  name: { type: String, required: true, default: "" },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  incomes: [{ type: Schema.Types.ObjectId, ref: "financialRecord" }],
  debts: [{ type: Schema.Types.ObjectId, ref: "financialRecord" }],
  expenses: [{ type: Schema.Types.ObjectId, ref: "financialRecord" }],
});

const User = model("user", UserSchema);

export default User;
