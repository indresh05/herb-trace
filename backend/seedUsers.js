require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log("Connecting to database to seed default users...");
    await db.sequelize.authenticate();

    // Default Farmer
    const farmerExists = await db.User.findOne({ where: { username: 'farmer1' } });
    if (!farmerExists) {
        const hash = await bcrypt.hash('1234', 12);
        const farmer = await db.User.create({
            username: 'farmer1',
            passwordHash: hash,
            role: 'farmer',
            organizationId: 'Org1MSP',
            fabricIdentity: 'appUser'
        });
        await db.Profile.create({
            userId: farmer.id,
            fullName: 'Gurpreet Singh',
            location: 'Moga, Punjab',
            facilityName: 'Singh Farm'
        });
        console.log("✅ Seeded farmer1");
    }

    // Default Processor
    const processorExists = await db.User.findOne({ where: { username: 'processor1' } });
    if (!processorExists) {
        const hash = await bcrypt.hash('1234', 12);
        const processor = await db.User.create({
            username: 'processor1',
            passwordHash: hash,
            role: 'processor',
            organizationId: 'Org1MSP',
            fabricIdentity: 'appUser'
        });
        await db.Profile.create({
            userId: processor.id,
            fullName: 'Rajesh Kumar',
            location: 'Ludhiana, Punjab',
            facilityName: 'Punjab Herb Processing Plant'
        });
        console.log("✅ Seeded processor1");
    }

    // Default Lab
    const labExists = await db.User.findOne({ where: { username: 'lab1' } });
    if (!labExists) {
        const hash = await bcrypt.hash('1234', 12);
        const lab = await db.User.create({
            username: 'lab1',
            passwordHash: hash,
            role: 'lab',
            organizationId: 'Org1MSP',
            fabricIdentity: 'appUser'
        });
        await db.Profile.create({
            userId: lab.id,
            fullName: 'Dr. Meera Arora',
            location: 'Amritsar, Punjab',
            facilityName: 'Punjab Quality Labs'
        });
        console.log("✅ Seeded lab1");
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
