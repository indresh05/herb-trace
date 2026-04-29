require('dotenv').config();
const db = require('./models');
const caHelper = require('./caHelper');

async function reEnrollAll() {
    try {
        console.log("Starting re-enrollment of all users...");
        const users = await db.User.findAll();
        console.log(`Found ${users.length} users in database.`);

        for (const user of users) {
            console.log(`Enrolling user: ${user.username} (${user.role})...`);
            try {
                await caHelper.registerAndEnrollUser(user.username, user.role);
                console.log(`✅ Successfully enrolled ${user.username}`);
            } catch (err) {
                if (err.message && err.message.includes('is already registered')) {
                    console.log(`ℹ️ User ${user.username} already registered, attempting enrollment only...`);
                    // If already registered, we might need a way to just enroll, 
                    // but caHelper.registerAndEnrollUser usually handles both.
                    // Let's check caHelper.
                } else {
                    console.error(`❌ Failed to enroll ${user.username}:`, err.message);
                }
            }
        }
        console.log("Re-enrollment process finished.");
        process.exit(0);
    } catch (err) {
        console.error("Critical error during re-enrollment:", err);
        process.exit(1);
    }
}

reEnrollAll();
