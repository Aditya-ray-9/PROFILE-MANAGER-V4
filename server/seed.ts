import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';

// Admin password encryption function
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Seed the database with initial admin user
async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'admin')
    });
    
    if (!existingAdmin) {
      // Create admin user with encrypted password
      const hashedPassword = await hashPassword('201099');
      
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run seeder
seed()
  .catch(console.error)
  .finally(() => process.exit(0));