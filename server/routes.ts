import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProfileSchema, insertDocumentSchema, insertCustomFieldSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

// Set up multer for file uploads
const storage_dir = path.join(process.cwd(), "uploads");
const createStorageDir = async () => {
  try {
    await fs.mkdir(storage_dir, { recursive: true });
  } catch (error) {
    console.error("Error creating upload directory:", error);
  }
};
createStorageDir();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storage_dir);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // GET /api/profiles - Get all profiles with pagination and filtering
  app.get("/api/profiles", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const query = (req.query.query as string) || "";
      const filter: Record<string, any> = {};
      
      // Add filter parameters if present
      if (req.query.profileType) {
        filter.profileType = req.query.profileType;
      }
      
      if (req.query.status) {
        filter.status = req.query.status;
      }
      
      if (req.query.includeArchived === "true") {
        filter.includeArchived = true;
      }
      
      const result = await storage.getProfiles(page, limit, query, filter);
      
      res.json(result);
    } catch (error) {
      console.error("Error getting profiles:", error);
      res.status(500).json({ message: "Error retrieving profiles" });
    }
  });
  
  // GET /api/profiles/favorites - Get favorite profiles
  app.get("/api/profiles/favorites", async (req: Request, res: Response) => {
    try {
      const favoriteProfiles = await storage.getFavoriteProfiles();
      res.json(favoriteProfiles);
    } catch (error) {
      console.error("Error getting favorite profiles:", error);
      res.status(500).json({ message: "Error retrieving favorite profiles" });
    }
  });
  
  // GET /api/profiles/archived - Get archived profiles
  app.get("/api/profiles/archived", async (req: Request, res: Response) => {
    try {
      const archivedProfiles = await storage.getArchivedProfiles();
      res.json(archivedProfiles);
    } catch (error) {
      console.error("Error getting archived profiles:", error);
      res.status(500).json({ message: "Error retrieving archived profiles" });
    }
  });
  
  // GET /api/profiles/:id - Get profile by ID
  app.get("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({ message: "Error retrieving profile" });
    }
  });
  
  // POST /api/profiles - Create new profile
  app.post("/api/profiles", async (req: Request, res: Response) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const newProfile = await storage.createProfile(profileData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Error creating profile" });
    }
  });
  
  // PUT /api/profiles/:id - Update profile
  app.put("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const profileData = insertProfileSchema.partial().parse(req.body);
      
      const updatedProfile = await storage.updateProfile(profileId, profileData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid profile data", 
          errors: error.errors 
        });
      }
      
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // DELETE /api/profiles/:id - Delete profile
  app.delete("/api/profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const success = await storage.deleteProfile(profileId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ message: "Error deleting profile" });
    }
  });
  
  // PUT /api/profiles/:id/favorite - Toggle favorite status
  app.put("/api/profiles/:id/favorite", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const updatedProfile = await storage.toggleFavorite(profileId);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      res.status(500).json({ message: "Error updating favorite status" });
    }
  });
  
  // PUT /api/profiles/:id/archive - Toggle archived status
  app.put("/api/profiles/:id/archive", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const updatedProfile = await storage.toggleArchived(profileId);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error toggling archived status:", error);
      res.status(500).json({ message: "Error updating archived status" });
    }
  });
  
  // Document Routes
  
  // GET /api/profiles/:id/documents - Get documents for a profile
  app.get("/api/profiles/:id/documents", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const documents = await storage.getDocumentsByProfile(profileId);
      res.json(documents);
    } catch (error) {
      console.error("Error getting documents:", error);
      res.status(500).json({ message: "Error retrieving documents" });
    }
  });
  
  // POST /api/profiles/:id/documents - Upload document for a profile
  app.post("/api/profiles/:id/documents", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const profileId = parseInt(req.params.id);
      const file = req.file;
      
      // Create document record
      const documentData = {
        profileId,
        name: req.body.name || file.originalname,
        fileType: file.mimetype,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size
      };
      
      const newDocument = await storage.createDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  
  // DELETE /api/documents/:id - Delete a document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Delete file from filesystem if it exists
      if (document.fileUrl) {
        try {
          const filePath = path.join(process.cwd(), document.fileUrl.replace(/^\//, ''));
          await fs.unlink(filePath);
        } catch (err) {
          console.error("Error deleting document file:", err);
          // Continue even if file deletion fails
        }
      }
      
      // Delete document record
      const success = await storage.deleteDocument(documentId);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting document" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error deleting document" });
    }
  });
  
  // Custom Fields Routes
  
  // GET /api/profiles/:id/custom-fields - Get custom fields for a profile
  app.get("/api/profiles/:id/custom-fields", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const customFields = await storage.getCustomFieldsByProfile(profileId);
      res.json(customFields);
    } catch (error) {
      console.error("Error getting custom fields:", error);
      res.status(500).json({ message: "Error retrieving custom fields" });
    }
  });
  
  // POST /api/profiles/:id/custom-fields - Add custom field to profile
  app.post("/api/profiles/:id/custom-fields", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      
      const customFieldData = insertCustomFieldSchema.parse({
        ...req.body,
        profileId
      });
      
      const newCustomField = await storage.createCustomField(customFieldData);
      res.status(201).json(newCustomField);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid custom field data", 
          errors: error.errors 
        });
      }
      
      console.error("Error adding custom field:", error);
      res.status(500).json({ message: "Error adding custom field" });
    }
  });
  
  // Settings Routes
  
  // GET /api/settings/:key - Get setting by key
  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      console.error("Error getting setting:", error);
      res.status(500).json({ message: "Error retrieving setting" });
    }
  });
  
  // PUT /api/settings/:key - Update setting
  app.put("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const value = req.body.value;
      
      const updatedSetting = await storage.setSetting(key, value);
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Error updating setting" });
    }
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
