import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profile schema
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull(),  // Added custom profile ID
  specialId: text("special_id").notNull(),  // Added special ID for searching
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  description: text("description"),  // Added description
  profilePicUrl: text("profile_pic_url"),
  isFavorite: boolean("is_favorite").default(false),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom fields schema (for extensibility)
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  fieldName: text("field_name").notNull(),
  fieldValue: text("field_value"),
  fieldType: text("field_type").default("text"),
});

// Application settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertProfileSchema = createInsertSchema(profiles, {
  email: z.string().email("Invalid email address"),
  specialId: z.string().min(2, "Special ID must be at least 2 characters"),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({ 
  id: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true, 
  updatedAt: true 
});

// Export types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

// User schema with role support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session storage for authentication
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  profileImageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
