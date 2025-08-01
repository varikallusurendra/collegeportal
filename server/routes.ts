import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertNewsSchema, insertEventSchema, insertStudentSchema, 
  insertAlumniSchema, insertAttendanceSchema, insertHeroNotificationSchema, insertImportantNotificationSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add authentication check for file access if needed
    next();
  }, (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const newsItems = await storage.getAllNews();
      res.json(newsItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const newsItem = await storage.createNews(validatedData);
      res.status(201).json(newsItem);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (news):", error.errors);
        res.status(400).json({ message: "Invalid news data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid news data" });
      }
    }
  });

  app.put("/api/news/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = parseInt(req.params.id);
      const allowedFields = ["title", "content"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          updateData[key] = req.body[key];
        }
      }
      const validatedData = insertNewsSchema.partial().parse(updateData);
      const updatedNews = await storage.updateNews(id, validatedData);
      if (!updatedNews) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json(updatedNews);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (news):", error.errors);
        res.status(400).json({ message: "Invalid news data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid news data" });
      }
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNews(id);
      
      if (!success) {
        return res.status(404).json({ message: "News not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete news" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const now = new Date();
      const eventsWithStatus = events.map(event => {
        let status = "upcoming";
        // Ensure dates are properly handled
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;
        
        if (startDate && endDate) {
          if (startDate <= now && now <= endDate) status = "ongoing";
          else if (endDate < now) status = "past";
        }
        return { ...event, status };
      });
      res.json(eventsWithStatus);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const allowedFields = ["title", "description", "company", "startDate", "endDate", "notificationLink", "attachmentUrl"];
      const eventData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== "") {
          eventData[key] = req.body[key];
        }
      }
      if (eventData.startDate && typeof eventData.startDate === "string") {
        eventData.startDate = new Date(eventData.startDate);
      }
      if (eventData.endDate && typeof eventData.endDate === "string") {
        eventData.endDate = new Date(eventData.endDate);
      }
      console.log("Event data before validation:", eventData);
      const validatedData = insertEventSchema.parse(eventData);
      console.log("Event data after validation:", validatedData);
      const event = await storage.createEvent(validatedData);
      // Compute status
      const now = new Date();
      let status = "upcoming";
      if (event.startDate <= now && event.endDate >= now) status = "ongoing";
      else if (event.endDate < now) status = "past";
      res.status(201).json({ ...event, status });
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (event):", error.errors);
        res.status(400).json({ message: "Invalid event data", details: error.errors });
      } else {
        console.error("Event creation error:", error);
        res.status(400).json({ message: "Invalid event data" });
      }
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = parseInt(req.params.id);
      const allowedFields = ["title", "description", "company", "startDate", "endDate", "notificationLink", "attachmentUrl"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          updateData[key] = req.body[key];
        }
      }
      if (updateData.startDate && typeof updateData.startDate === "string") {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.endDate && typeof updateData.endDate === "string") {
        updateData.endDate = new Date(updateData.endDate);
      }
      const validatedData = insertEventSchema.partial().parse(updateData);
      const updatedEvent = await storage.updateEvent(id, validatedData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      // Compute status
      const now = new Date();
      let status = "upcoming";
      if (updatedEvent.startDate <= now && updatedEvent.endDate >= now) status = "ongoing";
      else if (updatedEvent.endDate < now) status = "past";
      res.json({ ...updatedEvent, status });
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (event):", error.errors);
        res.status(400).json({ message: "Invalid event data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid event data" });
      }
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Student routes
  app.get("/api/students", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'offerLetter', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const studentData = { ...req.body };
      
      if (files.photo) {
        studentData.photoUrl = `/uploads/${files.photo[0].filename}`;
      }
      
      if (files.offerLetter) {
        studentData.offerLetterUrl = `/uploads/${files.offerLetter[0].filename}`;
      }
      
      const validatedData = insertStudentSchema.parse(studentData);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (student):", error.errors);
        res.status(400).json({ message: "Invalid student data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid student data" });
      }
    }
  });

  app.put("/api/students/:id", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'offerLetter', maxCount: 1 }
  ]), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const allowedFields = [
        "name", "rollNumber", "branch", "email", "phone", "photoUrl", "selected", "companyName", "offerLetterUrl"
      ];
      const studentData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          studentData[key] = req.body[key];
        }
      }
      if (files.photo) {
        studentData.photoUrl = `/uploads/${files.photo[0].filename}`;
      }
      if (files.offerLetter) {
        studentData.offerLetterUrl = `/uploads/${files.offerLetter[0].filename}`;
      }
      const validatedData = insertStudentSchema.partial().parse(studentData);
      const updatedStudent = await storage.updateStudent(id, validatedData);
      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(updatedStudent);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (student):", error.errors);
        res.status(400).json({ message: "Invalid student data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid student data" });
      }
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Alumni routes
  app.get("/api/alumni", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alumni = await storage.getAllAlumni();
      res.json(alumni);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alumni" });
    }
  });

  app.post("/api/alumni", async (req, res) => {
    try {
      const validatedData = insertAlumniSchema.parse(req.body);
      const alumni = await storage.createAlumni(validatedData);
      res.status(201).json(alumni);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (alumni):", error.errors);
        res.status(400).json({ message: "Invalid alumni data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid alumni data" });
      }
    }
  });

  app.put("/api/alumni/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = parseInt(req.params.id);
      const allowedFields = [
        "name", "rollNumber", "passOutYear", "higherEducationCollege", "collegeRollNumber", "address", "contactNumber", "email"
      ];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          updateData[key] = req.body[key];
        }
      }
      const validatedData = insertAlumniSchema.partial().parse(updateData);
      const updatedAlumni = await storage.updateAlumni(id, validatedData);
      if (!updatedAlumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      res.json(updatedAlumni);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (alumni):", error.errors);
        res.status(400).json({ message: "Invalid alumni data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid alumni data" });
      }
    }
  });

  app.delete("/api/alumni/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAlumni(id);
      
      if (!success) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alumni" });
    }
  });

  // Placement stats endpoint
  app.get("/api/placements/stats", async (req, res) => {
    try {
      const stats = await storage.getPlacementStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch placement stats" });
    }
  });

  // Recent placements endpoint
  app.get("/api/placements/recent", async (req, res) => {
    try {
      const recent = await storage.getRecentPlacements();
      res.json(recent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent placements" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const attendanceRecords = await storage.getAllAttendance();
      res.json(attendanceRecords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (attendance):", error.errors);
        res.status(400).json({ message: "Invalid attendance data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid attendance data" });
      }
    }
  });

  app.put("/api/attendance/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = parseInt(req.params.id);
      const allowedFields = ["eventId", "studentName", "rollNumber", "markedAt"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined && req.body[key] !== null) {
          updateData[key] = req.body[key];
        }
      }
      const validatedData = insertAttendanceSchema.partial().parse(updateData);
      const updatedAttendance = await storage.updateAttendance(id, validatedData);
      if (!updatedAttendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(updatedAttendance);
    } catch (error: any) {
      if (error && error.errors) {
        console.error("Zod validation error (attendance):", error.errors);
        res.status(400).json({ message: "Invalid attendance data", details: error.errors });
      } else {
        res.status(400).json({ message: "Invalid attendance data" });
      }
    }
  });

  // Hero Notifications API
  app.get("/api/hero-notifications", async (req, res) => {
    try {
      const items = await storage.getAllHeroNotifications();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero notifications" });
    }
  });
  app.get("/api/hero-notifications/:id", async (req, res) => {
    try {
      const item = await storage.getHeroNotificationById(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero notification" });
    }
  });
  app.post("/api/hero-notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validated = insertHeroNotificationSchema.parse(req.body);
      const item = await storage.createHeroNotification(validated);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", details: error.errors || error });
    }
  });
  app.put("/api/hero-notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const validated = insertHeroNotificationSchema.partial().parse(req.body);
      const item = await storage.updateHeroNotification(id, validated);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", details: error.errors || error });
    }
  });
  app.delete("/api/hero-notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const ok = await storage.deleteHeroNotification(id);
      if (!ok) return res.status(404).json({ message: "Not found" });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hero notification" });
    }
  });
  // Important Notifications API
  app.get("/api/important-notifications", async (req, res) => {
    try {
      const items = await storage.getAllImportantNotifications();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch important notifications" });
    }
  });
  app.get("/api/important-notifications/:id", async (req, res) => {
    try {
      const item = await storage.getImportantNotificationById(Number(req.params.id));
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch important notification" });
    }
  });
  app.post("/api/important-notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const validated = insertImportantNotificationSchema.parse(req.body);
      const item = await storage.createImportantNotification(validated);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", details: error.errors || error });
    }
  });
  app.put("/api/important-notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const validated = insertImportantNotificationSchema.partial().parse(req.body);
      const item = await storage.updateImportantNotification(id, validated);
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid data", details: error.errors || error });
    }
  });
  app.delete("/api/important-notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const ok = await storage.deleteImportantNotification(id);
      if (!ok) return res.status(404).json({ message: "Not found" });
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete important notification" });
    }
  });

  // Export routes
  app.get("/api/export/students", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const students = await storage.getAllStudents();
      // Exclude createdAt and updatedAt fields
      const exportStudents = students.map(({ createdAt, updatedAt, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(exportStudents);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export students" });
    }
  });

  app.get("/api/export/alumni", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alumni = await storage.getAllAlumni();
      const worksheet = XLSX.utils.json_to_sheet(alumni);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="alumni.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export alumni" });
    }
  });

  app.get("/api/export/attendance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const attendance = await storage.getAllAttendance();
      const worksheet = XLSX.utils.json_to_sheet(attendance);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', 'attachment; filename="attendance.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to export attendance" });
    }
  });

  // Import routes
  app.post("/api/import/students", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded", imported: 0, errors: [] });
      }

      const csvContent = req.file.buffer.toString();
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1);

      let imported = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.trim()) continue;

        const values = row.split(',').map(v => v.trim());
        const studentData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'name':
            case 'roll_number':
            case 'branch':
            case 'email':
            case 'phone':
            case 'company_name':
            case 'role':
              studentData[header] = value;
              break;
            case 'year':
            case 'package':
              studentData[header] = value ? parseInt(value) : null;
              break;
            case 'selected':
              studentData[header] = value.toLowerCase() === 'true';
              break;
          }
        });

        try {
          const validatedData = insertStudentSchema.parse(studentData);
          await storage.createStudent(validatedData);
          imported++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${i + 2}: ${errorMessage}`);
        }
      }

      res.json({
        success: imported > 0,
        message: `Imported ${imported} students successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        imported,
        errors
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: "Failed to import students", imported: 0, errors: [errorMessage] });
    }
  });

  app.post("/api/import/events", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded", imported: 0, errors: [] });
      }

      const csvContent = req.file.buffer.toString();
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1);

      let imported = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.trim()) continue;

        const values = row.split(',').map(v => v.trim());
        const eventData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'title':
            case 'description':
            case 'company':
              eventData[header] = value;
              break;
            case 'start_date':
              eventData.startDate = value;
              break;
            case 'end_date':
              eventData.endDate = value;
              break;
          }
        });

        try {
          const validatedData = insertEventSchema.parse(eventData);
          await storage.createEvent(validatedData);
          imported++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${i + 2}: ${errorMessage}`);
        }
      }

      res.json({
        success: imported > 0,
        message: `Imported ${imported} events successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        imported,
        errors
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: "Failed to import events", imported: 0, errors: [errorMessage] });
    }
  });

  app.post("/api/import/alumni", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded", imported: 0, errors: [] });
      }

      const csvContent = req.file.buffer.toString();
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1);

      let imported = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.trim()) continue;

        const values = row.split(',').map(v => v.trim());
        const alumniData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'name':
            case 'roll_number':
            case 'higher_education_college':
            case 'college_roll_number':
            case 'address':
            case 'contact_number':
            case 'email':
              alumniData[header] = value;
              break;
            case 'pass_out_year':
              alumniData[header] = value ? parseInt(value) : null;
              break;
          }
        });

        try {
          const validatedData = insertAlumniSchema.parse(alumniData);
          await storage.createAlumni(validatedData);
          imported++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${i + 2}: ${errorMessage}`);
        }
      }

      res.json({
        success: imported > 0,
        message: `Imported ${imported} alumni successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        imported,
        errors
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: "Failed to import alumni", imported: 0, errors: [errorMessage] });
    }
  });

  app.post("/api/import/attendance", upload.single('file'), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded", imported: 0, errors: [] });
      }

      const csvContent = req.file.buffer.toString();
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1);

      let imported = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row.trim()) continue;

        const values = row.split(',').map(v => v.trim());
        const attendanceData: any = {};

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'student_name':
            case 'roll_number':
              attendanceData[header] = value;
              break;
            case 'event_id':
              attendanceData[header] = value ? parseInt(value) : null;
              break;
          }
        });

        try {
          const validatedData = insertAttendanceSchema.parse(attendanceData);
          await storage.markAttendance(validatedData);
          imported++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Row ${i + 2}: ${errorMessage}`);
        }
      }

      res.json({
        success: imported > 0,
        message: `Imported ${imported} attendance records successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        imported,
        errors
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, message: "Failed to import attendance", imported: 0, errors: [errorMessage] });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
