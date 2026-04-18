import {logger} from "@shared/logger";
import { UserRepository } from "../repository/user.repository";
import type { User, NewUser } from "@shortrl/db/schema";
import crypto from "crypto";

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class UserService {
  private userRepository: UserRepository;
  private jwtSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  }

  async signup(request: SignupRequest): Promise<AuthResponse> {
    try {
      logger.info({ email: request.email }, "User signup attempt");

      const existingUser = await this.userRepository.findUserByEmail(
        request.email
      );

      if (existingUser) {
        logger.warn({ email: request.email }, "User already exists");
        throw new Error("User already exists");
      }

      const hashedPassword = this.hashPassword(request.password);

      const newUser: NewUser = {
        email: request.email,
        name: request.name,
        password: hashedPassword,
      };

      const user = await this.userRepository.createUser(newUser);
      const token = this.generateToken(user.id);

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

      const isPasswordValid = this.verifyPassword(
        request.password,
        user.password
      );

      if (!isPasswordValid) {
        logger.warn({ userId: user.id }, "Incorrect password");
        throw new Error("Invalid credentials");
      }

      const token = this.generateToken(user.id);
      logger.info({ userId: user.id }, "User signed in successfully");

      return { user, token };
    } catch (error) {
      logger.error({ error, email: request.email }, "Signin failed");
      throw error;
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  private verifyPassword(password: string, hash: string): boolean {
    const passwordHash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    return passwordHash === hash;
  }

  private generateToken(userId: string): string {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");

    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      })
    ).toString("base64url");

    const signature = crypto
      .createHmac("sha256", this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    return `${header}.${payload}.${signature}`;
  }
}
