import AuthServices from "../modules/auth/auth.service.js";
import { Request, Response } from "express";

//-------------------------------------------------------------------------------------//

export default class AuthController {
  //---------------------------------------//

  static async createUser(req: Request, res: Response) {
    try {
      const user = req.body.data || req.body;

      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress;
      const data = {
        ...user,
        ip: clientIp,
      };

      const result = await AuthServices.userCreate(data);

      res.status(201).json(result);
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async logInUser(req: Request, res: Response) {
    try {
      const data = req.body.data || req.body;
      const result = await AuthServices.logIn(data);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async authMeController(req: Request, res: Response) {
    try {
      await res.status(200).json({ user: req.user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", err });
    }
  }
  //---------------------------------------//
  static async deleteUserController(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      await AuthServices.deleteUserService(id);

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
}
