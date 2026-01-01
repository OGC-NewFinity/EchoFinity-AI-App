require('dotenv').config();
const { sequelize, User, Project, Video } = require('../models');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    // Sync models (force: false to avoid dropping existing tables)
    console.log('Syncing database models...');
    await sequelize.sync({ force: false });
    console.log('✓ Database models synced successfully.');

    // Test model access
    console.log('Testing model access...');
    const userCount = await User.count();
    const projectCount = await Project.count();
    const videoCount = await Video.count();

    console.log(`✓ Models accessible:`);
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Projects: ${projectCount}`);
    console.log(`  - Videos: ${videoCount}`);

    console.log('\n✓ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Database "echofinity" exists');
    process.exit(1);
  }
}

testDatabaseConnection();
