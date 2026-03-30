import { v4 as uuidv4 } from "uuid";

export default function UsersDao(db) {
  const findAllUsers = () => db.users;

  const findUserById = (id) => db.users.find((u) => u._id === id);

  const findUserByUsername = (username) =>
    db.users.find((u) => u.username === username);

  const createUser = (user) => {
    if (findUserByUsername(user.username)) {
      return null;
    }
    const newUser = { ...user, _id: uuidv4() };
    db.users = [...db.users, newUser];
    return newUser;
  };

  const updateUser = (userId, updates) => {
    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(
        ([, v]) => v !== undefined && v !== "",
      ),
    );
    db.users = db.users.map((u) =>
      u._id === userId ? { ...u, ...cleaned, _id: userId } : u,
    );
    return findUserById(userId);
  };

  const deleteUser = (userId) => {
    const before = db.users.length;
    db.users = db.users.filter((u) => u._id !== userId);
    return db.users.length < before;
  };

  return {
    findAllUsers,
    findUserById,
    findUserByUsername,
    createUser,
    updateUser,
    deleteUser,
  };
}
