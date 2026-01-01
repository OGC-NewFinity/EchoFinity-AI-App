module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscriptionTier: {
      type: DataTypes.ENUM('free', 'pro', 'premium', 'enterprise'),
      defaultValue: 'free',
    },
    dailyTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
  });

  return User;
};
