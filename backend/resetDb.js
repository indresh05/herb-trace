require('dotenv').config();
const db = require('./models');

async function reset() {
    await db.sequelize.authenticate();
    await db.Profile.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    console.log("Deleted all users and profiles.");
    process.exit(0);
}
reset();
