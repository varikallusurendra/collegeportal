// Script to add sample important notifications
// Run this with: node add-sample-notifications.js

import { db } from './server/db.js';
import { importantNotifications } from './shared/schema.js';

const sampleNotifications = [
  {
    title: "Placement Registration Open",
    type: "URGENT",
    link: "/placements/register"
  },
  {
    title: "Resume Building Workshop",
    type: "NEW",
    link: "/workshops/resume-building"
  },
  {
    title: "Mock Interview Sessions",
    type: "INFO",
    link: "/interviews/mock"
  },
  {
    title: "Final Year Project Submission Deadline",
    type: "URGENT",
    link: "/projects/submit"
  },
  {
    title: "Industry Expert Talk - AI in Software Development",
    type: "EVENT",
    link: "/events/ai-talk"
  }
];

async function addSampleNotifications() {
  try {
    console.log('Adding sample important notifications...');
    
    for (const notification of sampleNotifications) {
      await db.insert(importantNotifications).values(notification);
      console.log(`Added: ${notification.title}`);
    }
    
    console.log('Sample notifications added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding notifications:', error);
    process.exit(1);
  }
}

addSampleNotifications(); 