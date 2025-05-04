import { db } from "./index";
import * as schema from "../shared/schema";
import bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    let user;
    // Check if user already exists
    const existingUsers = await db.select().from(schema.users).where(eq(schema.users.email, "test@example.com"));
    const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;
    
    if (!existingUser) {
      const [newUser] = await db.insert(schema.users).values({
        username: "TestUser",
        email: "test@example.com",
        password: hashedPassword
      }).returning();
      
      user = newUser;
      console.log("Created test user:", user.username);
    } else {
      user = existingUser;
      console.log("Using existing user:", user.username);
    }

    // Sample dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sixDaysAgo = new Date(today);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    
    // Sample health data
    const healthDataSamples = [
      // Blood pressure - systolic
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 120, timestamp: today },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 124, timestamp: yesterday },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 118, timestamp: twoDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 122, timestamp: threeDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 126, timestamp: fourDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 120, timestamp: fiveDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_SYSTOLIC, value: 118, timestamp: sixDaysAgo },
      
      // Blood pressure - diastolic
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 80, timestamp: today },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 82, timestamp: yesterday },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 78, timestamp: twoDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 80, timestamp: threeDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 84, timestamp: fourDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 82, timestamp: fiveDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.BLOOD_PRESSURE_DIASTOLIC, value: 80, timestamp: sixDaysAgo },
      
      // Heart rate
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 72, timestamp: today },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 75, timestamp: yesterday },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 70, timestamp: twoDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 78, timestamp: threeDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 73, timestamp: fourDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 72, timestamp: fiveDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.HEART_RATE, value: 74, timestamp: sixDaysAgo },
      
      // Glucose
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 185, timestamp: today },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 180, timestamp: yesterday },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 165, timestamp: twoDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 120, timestamp: threeDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 145, timestamp: fourDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 110, timestamp: fiveDaysAgo },
      { userId: user.id, parameterType: schema.parameterTypes.GLUCOSE, value: 95, timestamp: sixDaysAgo }
    ];

    // Check if there's any existing health data for the user
    const existingHealthData = await db.select().from(schema.healthData).where(eq(schema.healthData.userId, user.id));

    // Only insert sample data if there's no existing data
    if (existingHealthData.length === 0) {
      for (const sample of healthDataSamples) {
        await db.insert(schema.healthData).values({
          userId: sample.userId,
          parameterType: sample.parameterType,
          value: sample.value.toString(),
          timestamp: sample.timestamp
        });
      }
      console.log(`Inserted ${healthDataSamples.length} health data samples`);
    } else {
      console.log(`Found ${existingHealthData.length} existing health data records, skipping seed`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
