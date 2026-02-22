require('dotenv').config();
const db = require('./models');
const bcrypt = require('bcryptjs');
const caHelper = require('./caHelper'); // Added 

async function seed() {
    console.log("Connecting to database to seed default users...");
    await db.sequelize.authenticate();

    // Default Farmer
    const farmerExists = await db.User.findOne({ where: { username: 'farmer1' } });
    if (!farmerExists) {
        console.log("Enrolling farmer1 in Fabric CA...");
        const caRes = await caHelper.registerAndEnrollUser('farmer1', 'farmer');

        const hash = await bcrypt.hash('password123', 12);
        const farmer = await db.User.create({
            username: 'farmer1',
            passwordHash: hash,
            role: 'farmer',
            organizationId: caRes.mspId,
            fabricIdentity: 'farmer1'
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
        console.log("Enrolling processor1 in Fabric CA...");
        const caRes = await caHelper.registerAndEnrollUser('processor1', 'processor');

        const hash = await bcrypt.hash('password123', 12);
        const processor = await db.User.create({
            username: 'processor1',
            passwordHash: hash,
            role: 'processor',
            organizationId: caRes.mspId,
            fabricIdentity: 'processor1'
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
        console.log("Enrolling lab1 in Fabric CA...");
        const caRes = await caHelper.registerAndEnrollUser('lab1', 'lab');

        const hash = await bcrypt.hash('password123', 12);
        const lab = await db.User.create({
            username: 'lab1',
            passwordHash: hash,
            role: 'lab',
            organizationId: caRes.mspId,
            fabricIdentity: 'lab1'
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
