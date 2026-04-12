import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function UsersDao(_db) {
  const createUser = (user) => {
    const { _id, ...rest } = user;
    const newUser = { ...rest, _id: uuidv4() };
    return model.create(newUser);
  };

  const findAllUsers = () => model.find();

  const findUserById = (userId) => model.findById(userId);

  const findUserByUsername = (username) =>
    model.findOne({ username: username });

  const findUserByCredentials = (username, password) =>
    model.findOne({ username, password });

  const findUsersByRole = (role) => model.find({ role: role });

  const findUsersByPartialName = (partialName) => {
    const regex = new RegExp(partialName, "i");
    return model.find({
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
      ],
    });
  };

  const findUsersByRoleAndPartialName = (role, partialName) => {
    const regex = new RegExp(partialName, "i");
    return model.find({
      role,
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
      ],
    });
  };

  const updateUser = (userId, user) =>
    model.updateOne({ _id: userId }, { $set: user });

  const deleteUser = (userId) => model.findByIdAndDelete(userId);

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByCredentials,
    findUsersByRole,
    findUsersByPartialName,
    findUsersByRoleAndPartialName,
    updateUser,
    deleteUser,
  };
}
