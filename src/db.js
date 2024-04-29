import { MongoClient } from 'mongodb';
import pg from 'pg';

const { Client: PostgreClient } = pg;

async function getMongoConnection() {
    const {
        MONGO_USERNAME,
        MONGO_PASSWORD,
        MONGO_HOST,
        MONGO_PORT,
    } = process.env

    const mongoUri = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`;
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();

        const dbName = 'school';
        const db = client.db(dbName);
        const collection = db.collection('students');

        return {
            students: collection,
            client,
        };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

async function getPostgresConnection() {
    const {
        POSTGRES_USER,
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_PASSWORD,
        POSTGRES_DB,
    } = process.env

    const client = new PostgreClient({
        user: POSTGRES_USER,
        host: POSTGRES_HOST,
        database: POSTGRES_DB,
        password: POSTGRES_PASSWORD,
        port: POSTGRES_PORT,
    });

    await client.connect();
    return {
        client,
        students: {
            async insert(person) {
                const { name, email, age, registeredAt } = person;
                const query = 'INSERT INTO students (name, email, age, registered_at) VALUES ($1, $2, $3, $4)';
                const values = [name, email, age, registeredAt];

                await client.query(query, values);

            },
            async list(limit = 100) {
                const query = 'SELECT * FROM students LIMIT $1';
                const values = [limit];

                const result = await client.query(query, values);
                return result.rows;

            },
            async count() {
                const query = 'SELECT COUNT(1) as total FROM students';

                const result = await client.query(query);
                return Number(result.rows[0].total);

            },
            async deleteAll() {
                const query = 'DELETE FROM students';

                await client.query(query);
            },
            async createTable() {
                const createStudentsTableQuery = `
                        CREATE TABLE IF NOT EXISTS students (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            email VARCHAR(255) NOT NULL,
                            age INT NOT NULL,
                            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )`;
                await client.query(createStudentsTableQuery);
            }
        }
    };
}

export { getMongoConnection, getPostgresConnection };
