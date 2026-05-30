import { readJSON, writeJSON, USERS_FILE } from './db.js';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export const User = {
  /**
   * Find a user based on specific filters (e.g. { email })
   */
  async findOne(filter: Partial<IUser>): Promise<IUser | null> {
    const users = readJSON(USERS_FILE);
    const found = users.find((u: any) => {
      return Object.entries(filter).every(([key, val]) => u[key] === val);
    });
    return found || null;
  },

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    const users = readJSON(USERS_FILE);
    const found = users.find((u: any) => u._id === id);
    return found || null;
  },

  /**
   * Create and persist a new user record
   */
  async create(data: { name: string; email: string; passwordHash: string }): Promise<IUser> {
    const users = readJSON(USERS_FILE);
    const newUser: IUser = {
      _id: Math.random().toString(36).substring(2, 11),
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    return newUser;
  }
};
