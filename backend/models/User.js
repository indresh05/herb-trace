module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('farmer', 'processor', 'lab'),
            allowNull: false,
        },
        organizationId: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Org1MSP', // Defaulting to Org1 for this prototype's single-org structure
        },
        fabricIdentity: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'appUser', // In true prod, this maps to their specific wallet cert
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'SUSPENDED'),
            defaultValue: 'ACTIVE',
        },
    }, {
        tableName: 'users',
        timestamps: true,
    });

    return User;
};
