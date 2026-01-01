module.exports = (sequelize, DataTypes) => {
  const TokenUsage = sequelize.define(
    'TokenUsage',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      operation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokensUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parameters: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      indexes: [
        {
          fields: ['userId', 'createdAt'],
        },
        {
          fields: ['userId'],
        },
      ],
    }
  );

  return TokenUsage;
};
