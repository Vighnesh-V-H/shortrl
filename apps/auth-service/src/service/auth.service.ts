import { logger } from "@shared/logger";
import { UserRepository } from "../repository/user.repository";
import type { User, NewUser } from "@shortrl/db/schema";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth.utils";
import type { AuthResponse, SigninRequest, SignupRequest } from "../interface/user.interface";

export class UserService {
  private userRepository: UserRepository;
  private  jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  async signup(request: SignupRequest): Promise<AuthResponse> {
    try {
      logger.info({ email: request.email }, "User signup attempt");

      const existingUser = await this.userRepository.findUserByEmail(request.email);

      if (existingUser) {
        logger.warn({ email: request.email }, "User already exists");
        throw new Error("User already exists");
      }

      const hashedPassword = hashPassword(request.password);

      const newUser: NewUser = {
        email: request.email,
        name: request.name,
        password: hashedPassword,
      };

      const user = await this.userRepository.createUser(newUser);
      const token = generateToken(user.id, this.jwtSecret);

      logger.info({ userId: user.id }, "User registered successfully");

      return { user, token };
    } catch (error) {
      logger.error({ error, email: request.email }, "Signup failed");
      throw error;
    }
  }

  async signin(request: SigninRequest): Promise<AuthResponse> {
    try {
      logger.info({ email: request.email }, "User signin attempt");

      const user = await this.userRepository.findUserByEmail(request.email);

      if (!user) {
        logger.warn({ email: request.email }, "User not found");
        throw new Error("Invalid credentials");
      }

      const isPasswordValid = verifyPassword(request.password, user.password);

      if (!isPasswordValid) {
        logger.warn({ userId: user.id }, "Incorrect password");
        throw new Error("Invalid credentials");
      }

      const token = generateToken(user.id, this.jwtSecret);
      logger.info({ userId: user.id }, "User signed in successfully");

      return { user, token };
    } catch (error) {
      logger.error({ error, email: request.email }, "Signin failed");
      throw error;
    }
  }
}
