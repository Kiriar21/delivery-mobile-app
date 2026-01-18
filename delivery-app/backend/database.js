const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './delivery.sqlite';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            name TEXT,
            is_active INTEGER DEFAULT 1
        )`);

        // Check for is_active column in existing users table and add if missing
        db.all("PRAGMA table_info(users)", (err, columns) => {
            if (!err) {
                const hasIsActive = columns.some(c => c.name === 'is_active');
                if (!hasIsActive) {
                    db.run("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1", (err) => {
                        if (err) console.error("Error adding is_active column", err);
                        else console.log("Added is_active column to users table");
                    });
                }
            }
        });

        // Deliveries Table
        db.run(`CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deliveryNumber TEXT,
            date TEXT,
            address TEXT,
            status TEXT,
            notes TEXT,
            creator_id INTEGER,
            courier_id INTEGER,
            estimated_date TEXT,
            FOREIGN KEY(creator_id) REFERENCES users(id),
            FOREIGN KEY(courier_id) REFERENCES users(id)
        )`, (err) => {
            if (!err) {
                // Migration for existing tables
                db.run("ALTER TABLE deliveries ADD COLUMN estimated_date TEXT", (err) => {
                    // Ignore error if column exists
                });
            }
        });

        // Items Table
        db.run(`CREATE TABLE IF NOT EXISTS delivery_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delivery_id INTEGER,
            name TEXT,
            quantity INTEGER,
            confirmed INTEGER DEFAULT 0,
            delivered_quantity INTEGER DEFAULT 0,
            pending_quantity INTEGER DEFAULT 0,
            FOREIGN KEY(delivery_id) REFERENCES deliveries(id)
        )`);

        // Check columns for delivery_items
        db.all("PRAGMA table_info(delivery_items)", (err, columns) => {
            if (!err) {
                const hasDelivered = columns.some(c => c.name === 'delivered_quantity');
                const hasPending = columns.some(c => c.name === 'pending_quantity');

                if (!hasDelivered) {
                    db.run("ALTER TABLE delivery_items ADD COLUMN delivered_quantity INTEGER DEFAULT 0");
                    console.log("Added delivered_quantity column");
                }
                if (!hasPending) {
                    db.run("ALTER TABLE delivery_items ADD COLUMN pending_quantity INTEGER DEFAULT 0");
                    console.log("Added pending_quantity column");
                }
            }
        });

        // Seed Admin
        const adminUsername = 'admin';
        db.get("SELECT * FROM users WHERE username = ?", [adminUsername], (err, row) => {
            if (!row) {
                const hash = bcrypt.hashSync('admin', 10);
                db.run("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)",
                    [adminUsername, hash, 'admin', 'Administrator Systemu']);
                console.log("Seeded admin user.");
            }
        });
    });
}

module.exports = db;
