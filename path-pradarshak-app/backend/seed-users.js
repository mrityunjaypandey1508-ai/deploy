const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    phone: '1234567890',
    skills: ['JavaScript', 'React', 'Node.js'],
    goals: ['Learn TypeScript', 'Build a full-stack app'],
    interests: ['Web Development', 'AI'],
    bio: 'Full-stack developer passionate about creating user-friendly applications.',
    location: 'San Francisco, CA'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
    phone: '2345678901',
    skills: ['Python', 'Django', 'Machine Learning'],
    goals: ['Master Data Science', 'Contribute to open source'],
    interests: ['Data Science', 'Open Source'],
    bio: 'Data scientist with a love for machine learning and open source projects.',
    location: 'New York, NY'
  },
  {
    name: 'Carol Davis',
    email: 'carol@example.com',
    password: 'password123',
    phone: '3456789012',
    skills: ['Java', 'Spring Boot', 'Microservices'],
    goals: ['Learn Cloud Architecture', 'Get AWS certification'],
    interests: ['Cloud Computing', 'DevOps'],
    bio: 'Backend developer specializing in microservices and cloud architecture.',
    location: 'Austin, TX'
  },
  {
    name: 'David Wilson',
    email: 'david@example.com',
    password: 'password123',
    phone: '4567890123',
    skills: ['React Native', 'Mobile Development', 'UI/UX'],
    goals: ['Launch mobile app', 'Improve design skills'],
    interests: ['Mobile Development', 'Design'],
    bio: 'Mobile developer focused on creating beautiful and functional apps.',
    location: 'Seattle, WA'
  },
  {
    name: 'Eva Brown',
    email: 'eva@example.com',
    password: 'password123',
    phone: '5678901234',
    skills: ['Vue.js', 'CSS', 'Frontend Development'],
    goals: ['Master Vue 3', 'Learn backend development'],
    interests: ['Frontend Development', 'Backend Development'],
    bio: 'Frontend developer transitioning to full-stack development.',
    location: 'Chicago, IL'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing test users (optional)
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Add test users
    const createdUsers = await User.insertMany(testUsers);
    console.log(`Created ${createdUsers.length} test users:`);
    
    createdUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    console.log('\nTest users added successfully!');
    console.log('You can now search for these users in your app.');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers();


