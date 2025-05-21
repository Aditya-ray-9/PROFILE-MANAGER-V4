import { 
  profiles, 
  documents, 
  customFields, 
  settings,
  users,
  type Profile, 
  type InsertProfile, 
  type Document, 
  type InsertDocument, 
  type CustomField, 
  type InsertCustomField,
  type Setting,
  type InsertSetting,
  type User,
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, desc, asc, or, isNull, not, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile methods
  getProfile(id: number): Promise<Profile | undefined>;
  getProfiles(page?: number, limit?: number, query?: string, filter?: Record<string, any>): Promise<{ profiles: Profile[], total: number }>;
  getFavoriteProfiles(): Promise<Profile[]>;
  getArchivedProfiles(): Promise<Profile[]>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<Profile | undefined>;
  toggleArchived(id: number): Promise<Profile | undefined>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByProfile(profileId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Custom fields methods
  getCustomFieldsByProfile(profileId: number): Promise<CustomField[]>;
  createCustomField(customField: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: number, value: string): Promise<CustomField | undefined>;
  deleteCustomField(id: number): Promise<boolean>;
  
  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: any): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }
  
  async getProfiles(page = 1, limit = 10, query = "", filter: Record<string, any> = {}): Promise<{ profiles: Profile[], total: number }> {
    const offset = (page - 1) * limit;
    
    let conditions = [];
    
    // Add search query condition if provided
    if (query) {
      conditions.push(
        or(
          like(profiles.firstName, `%${query}%`),
          like(profiles.lastName, `%${query}%`),
          like(profiles.email, `%${query}%`)
        )
      );
    }
    
    // Add filters
    if (filter.profileType) {
      conditions.push(eq(profiles.profileType, filter.profileType));
    }
    
    if (filter.status) {
      conditions.push(eq(profiles.status, filter.status));
    }
    
    // Filter out archived profiles unless specifically requested
    if (!filter.includeArchived) {
      conditions.push(eq(profiles.isArchived, false));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql`count(${profiles.id})` })
      .from(profiles)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);
      
    // Get profiles with pagination
    const result = await db
      .select()
      .from(profiles)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(profiles.updatedAt));
      
    return {
      profiles: result,
      total: total
    };
  }
  
  async getFavoriteProfiles(): Promise<Profile[]> {
    return db
      .select()
      .from(profiles)
      .where(and(
        eq(profiles.isFavorite, true),
        eq(profiles.isArchived, false)
      ))
      .orderBy(desc(profiles.updatedAt));
  }
  
  async getArchivedProfiles(): Promise<Profile[]> {
    return db
      .select()
      .from(profiles)
      .where(eq(profiles.isArchived, true))
      .orderBy(desc(profiles.updatedAt));
  }
  
  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(insertProfile)
      .returning();
    return profile;
  }
  
  async updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    // Add updatedAt timestamp
    const updateData = { 
      ...profile, 
      updatedAt: new Date() 
    };
    
    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, id))
      .returning();
      
    return updatedProfile;
  }
  
  async deleteProfile(id: number): Promise<boolean> {
    const result = await db
      .delete(profiles)
      .where(eq(profiles.id, id));
      
    return true;
  }
  
  async toggleFavorite(id: number): Promise<Profile | undefined> {
    // First get current profile
    const profile = await this.getProfile(id);
    if (!profile) return undefined;
    
    // Toggle favorite status
    const [updatedProfile] = await db
      .update(profiles)
      .set({ 
        isFavorite: !profile.isFavorite,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, id))
      .returning();
      
    return updatedProfile;
  }
  
  async toggleArchived(id: number): Promise<Profile | undefined> {
    // First get current profile
    const profile = await this.getProfile(id);
    if (!profile) return undefined;
    
    // Toggle archived status
    const [updatedProfile] = await db
      .update(profiles)
      .set({ 
        isArchived: !profile.isArchived,
        updatedAt: new Date()
      })
      .where(eq(profiles.id, id))
      .returning();
      
    return updatedProfile;
  }
  
  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
      
    return document;
  }
  
  async getDocumentsByProfile(profileId: number): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.profileId, profileId))
      .orderBy(desc(documents.createdAt));
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const [createdDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
      
    return createdDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    await db
      .delete(documents)
      .where(eq(documents.id, id));
      
    return true;
  }
  
  // Custom fields methods
  async getCustomFieldsByProfile(profileId: number): Promise<CustomField[]> {
    return db
      .select()
      .from(customFields)
      .where(eq(customFields.profileId, profileId));
  }
  
  async createCustomField(customField: InsertCustomField): Promise<CustomField> {
    const [createdField] = await db
      .insert(customFields)
      .values(customField)
      .returning();
      
    return createdField;
  }
  
  async updateCustomField(id: number, value: string): Promise<CustomField | undefined> {
    const [updatedField] = await db
      .update(customFields)
      .set({ fieldValue: value })
      .where(eq(customFields.id, id))
      .returning();
      
    return updatedField;
  }
  
  async deleteCustomField(id: number): Promise<boolean> {
    await db
      .delete(customFields)
      .where(eq(customFields.id, id));
      
    return true;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
      
    return setting;
  }
  
  async setSetting(key: string, value: any): Promise<Setting> {
    // Check if setting already exists
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      // Update existing setting
      const [updatedSetting] = await db
        .update(settings)
        .set({ 
          value,
          updatedAt: new Date()
        })
        .where(eq(settings.key, key))
        .returning();
        
      return updatedSetting;
    } else {
      // Create new setting
      const [newSetting] = await db
        .insert(settings)
        .values({
          key,
          value
        })
        .returning();
        
      return newSetting;
    }
  }
}

export const storage = new DatabaseStorage();
