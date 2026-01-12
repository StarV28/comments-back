import bcrypt from "bcrypt";
import prisma from "../../../prisma/prisma.js";
import type { AuthData, LoginDTO } from "../../../types/auth.type.js";
import { prepareToken } from "../../../utils/jwtHelpers.js";

//-------------------------------------------------------------------------------------//

export default class AuthServices {
  //---------------------------------------//
  static async userCreate(data: AuthData) {
    try {
      if (!data.password) throw new Error("Password is required");

      const hashPass = await bcrypt.hash(data.password, 10);
      data.password = hashPass;

      const result = await prisma.user.create({ data });

      const token = prepareToken({
        id: result.id,
        email: result.email,
      });

      const user = {
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          createdAt: result.createdAt,
        },
        token,
      };

      return user;
    } catch (err) {
      console.error("Error create user services", (err as Error)?.message);
      throw err;
    }
  }
  //---------------------------------------//

  static async logIn(data: LoginDTO) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(data.password, user.password);

      if (!isMatch) {
        throw new Error("Invalid email or password");
      }
      const token = prepareToken({
        id: user.id,
        email: user.email,
      });
      const userRes = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      };
      return userRes;
    } catch (err) {
      console.error("Error login user services", (err as Error)?.message);
      throw err;
    }
  }
  //---------------------------------------//
  static async deleteUserService(id: number) {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (err) {
      console.error("Error delete user services", (err as Error)?.message);
      throw err;
    }
  }
}
