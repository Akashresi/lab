const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.POSTGRES_URI || "postgres://postgres:Akash@@6655@localhost:5433/quizmaster",
    {
        dialect: "postgres",
        logging: console.log,
    }
);

const fixSchema = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Connected to DB");

        console.log("🛠 Fix: Ensure created_at exists in quizzes...");

        // 1. Add column if not exists (Postgres doesn't support IF NOT EXISTS in ADD COLUMN easily in all versions, 
        // but we can catch error or just run it)
        try {
            await sequelize.query(`
                ALTER TABLE quizzes 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            `);
        } catch (e) {
            console.log("info: add column might have failed or existed");
        }

        // 2. Populate NULLs
        await sequelize.query(`
            UPDATE quizzes 
            SET created_at = NOW() 
            WHERE created_at IS NULL;
        `);

        // 3. Set Not Null
        await sequelize.query(`
            ALTER TABLE quizzes 
            ALTER COLUMN created_at SET NOT NULL;
        `);

        // 4. Same for updated_at just in case
        try {
            await sequelize.query(`
                ALTER TABLE quizzes 
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            `);
            await sequelize.query(`
                UPDATE quizzes 
                SET updated_at = NOW() 
                WHERE updated_at IS NULL;
            `);
        } catch (e) { }


        console.log("✅ Schema Fix Applied");
    } catch (error) {
        console.error("❌ Fix Failed:", error);
    } finally {
        await sequelize.close();
    }
};

fixSchema();
