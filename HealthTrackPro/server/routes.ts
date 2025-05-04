import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticate, generateToken } from "./auth";
import { insertUserSchema, loginUserSchema, insertHealthDataSchema, parameterTypes } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create new user
      const user = await storage.createUser(
        userData.username,
        userData.email,
        userData.password
      );
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      return res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "Error registering user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      // Verify user credentials
      const user = await storage.verifyUser(loginData.email, loginData.password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error logging in:", error);
      return res.status(500).json({ message: "Error logging in" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: Request, res: Response) => {
    try {
      // User is already authenticated via middleware
      return res.status(200).json({
        user: req.user
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // Health data routes
  app.post("/api/healthdata", authenticate, async (req: Request, res: Response) => {
    try {
      const { parameterType, value, timestamp, notes } = req.body;
      
      // Validate parameter type
      if (!Object.values(parameterTypes).includes(parameterType)) {
        return res.status(400).json({ message: "Invalid parameter type" });
      }
      
      // Create health data
      const data = await storage.createHealthData(
        req.user!.id,
        parameterType,
        value,
        timestamp ? new Date(timestamp) : undefined,
        notes
      );
      
      return res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating health data:", error);
      return res.status(500).json({ message: "Error creating health data" });
    }
  });

  app.get("/api/healthdata", authenticate, async (req: Request, res: Response) => {
    try {
      const parameterType = req.query.type as string;
      const dateFrom = req.query.from ? new Date(req.query.from as string) : undefined;
      const dateTo = req.query.to ? new Date(req.query.to as string) : undefined;
      
      // Get health data based on parameter type or all
      let data;
      if (parameterType && Object.values(parameterTypes).includes(parameterType)) {
        data = await storage.getHealthDataByType(req.user!.id, parameterType, dateFrom, dateTo);
      } else {
        data = await storage.getHealthDataByUserId(req.user!.id, dateFrom, dateTo);
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching health data:", error);
      return res.status(500).json({ message: "Error fetching health data" });
    }
  });

  app.get("/api/healthdata/latest", authenticate, async (req: Request, res: Response) => {
    try {
      // Get latest readings for all parameter types
      const latestData = await Promise.all(
        Object.values(parameterTypes).map(async (type) => {
          const data = await storage.getLatestHealthData(req.user!.id, type);
          return {
            type,
            data
          };
        })
      );
      
      // Group blood pressure data
      const latestBloodPressure = {
        systolic: latestData.find(d => d.type === parameterTypes.BLOOD_PRESSURE_SYSTOLIC)?.data,
        diastolic: latestData.find(d => d.type === parameterTypes.BLOOD_PRESSURE_DIASTOLIC)?.data
      };
      
      // Return grouped data
      return res.status(200).json({
        bloodPressure: latestBloodPressure,
        heartRate: latestData.find(d => d.type === parameterTypes.HEART_RATE)?.data,
        glucose: latestData.find(d => d.type === parameterTypes.GLUCOSE)?.data
      });
    } catch (error) {
      console.error("Error fetching latest health data:", error);
      return res.status(500).json({ message: "Error fetching latest health data" });
    }
  });

  app.put("/api/healthdata/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { value, timestamp, notes } = req.body;
      
      // Update health data
      const updated = await storage.updateHealthData(id, {
        value: value?.toString(),
        timestamp: timestamp ? new Date(timestamp) : undefined,
        notes
      });
      
      if (!updated) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Error updating health data:", error);
      return res.status(500).json({ message: "Error updating health data" });
    }
  });

  app.delete("/api/healthdata/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Delete health data
      const deleted = await storage.deleteHealthData(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      return res.status(200).json({ message: "Health data deleted" });
    } catch (error) {
      console.error("Error deleting health data:", error);
      return res.status(500).json({ message: "Error deleting health data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
