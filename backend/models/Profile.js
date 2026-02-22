module.exports = (sequelize, DataTypes) => {
    const Profile = sequelize.define('Profile', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Used for Farmer/Collector names, Processor Managers, or Lab Managers
        fullName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // For Farmers: Farm Location, Processors: Facility Location, Labs: Lab Location
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // The specific business name: e.g., 'Punjab Herb Processing Plant'
        facilityName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'profiles',
        timestamps: true,
    });

    return Profile;
};
