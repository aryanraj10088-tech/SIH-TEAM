import { IUser } from '../../models/User';

declare global {
  namespace Express {
    // Aligns passport's Express.User type with our IUser model,
    // preventing @types/passport from overriding req.user type.
    interface User extends IUser {}

    interface Request {
      user?: IUser;
    }
  }
}
