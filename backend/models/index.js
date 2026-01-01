const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Project = require('./Project')(sequelize, DataTypes);
const Video = require('./Video')(sequelize, DataTypes);
const TokenUsage = require('./TokenUsage')(sequelize, DataTypes);

// Define associations
User.hasMany(Project, {
  foreignKey: 'userId',
  as: 'projects',
});

Project.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Project.hasMany(Video, {
  foreignKey: 'projectId',
  as: 'videos',
});

Video.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

// TokenUsage associations
User.hasMany(TokenUsage, {
  foreignKey: 'userId',
  as: 'tokenUsage',
});

TokenUsage.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Project,
  Video,
  TokenUsage,
};
