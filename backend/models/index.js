const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME || 'herbtrace',
    process.env.DB_USER || 'admin',
    process.env.DB_PASS || 'enterprise_password',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false, // Set to console.log to see SQL queries
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load Models
db.User = require('./User')(sequelize, Sequelize);
db.Profile = require('./Profile')(sequelize, Sequelize);

// Define Relationships
db.User.hasOne(db.Profile, {
    foreignKey: 'userId',
    as: 'profile',
});
db.Profile.belongsTo(db.User, {
    foreignKey: 'userId',
    as: 'user',
});

module.exports = db;
