const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ---
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(401).send('Nieprawidłowy login lub hasło');

        if (user.is_active === 0) return res.status(403).send('Konto zostało zablokowane.');

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
        } else {
            res.status(401).send('Nieprawidłowy login lub hasło');
        }
    });
});

app.post('/auth/register', (req, res) => {
    const { username, password, name, role } = req.body;
    const validRoles = ['client', 'courier', 'admin']; // 'client' = Zamawiający, 'courier' = Dostawca
    const userRole = validRoles.includes(role) ? role : 'client'; // Default to client if invalid

    const hash = bcrypt.hashSync(password, 10);

    db.run("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)",
        [username, hash, userRole, name],
        function (err) {
            if (err) {
                return res.status(400).send('Użytkownik już istnieje lub błąd danych');
            }
            res.status(201).json({ message: 'Rejestracja pomyślna' });
        }
    );
});

// --- DELIVERIES ---

// GET /deliveries
// Admin: All
// Courier: Only assigned to them OR unassigned (pool)
// Client: Only created by them
app.get('/deliveries', authenticateToken, (req, res) => {
    const { role, id } = req.user;
    let query = `
        SELECT d.*, 
               u1.name as creator_name, 
               u2.name as courier_name 
        FROM deliveries d
        LEFT JOIN users u1 ON d.creator_id = u1.id
        LEFT JOIN users u2 ON d.courier_id = u2.id
    `;
    let params = [];

    if (role === 'client') {
        query += " WHERE d.creator_id = ?";
        params.push(id);
    } else if (role === 'courier') {
        // Couriers see their own active deliveries AND new unassigned ones they can pick up
        query += " WHERE d.courier_id = ? OR d.status = 'new'";
        params.push(id);
    } else if (role === 'admin') {
        // See all
    }

    query += " ORDER BY d.date DESC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send(err.message);

        // Fetch items for each delivery
        // This is N+1 but fine for small scale. 
        // Better: Fetch all items for these delivery IDs.
        if (rows.length === 0) return res.json([]);

        const deliveryIds = rows.map(r => r.id);
        db.all(`SELECT * FROM delivery_items WHERE delivery_id IN (${deliveryIds.join(',')})`, [], (err, items) => {
            if (err) return res.status(500).send(err.message);

            const result = rows.map(d => ({
                ...d,
                items: items.filter(i => i.delivery_id === d.id).map(i => ({ ...i, confirmed: !!i.confirmed }))
            }));
            res.json(result);
        });
    });
});

// GET Single Delivery
app.get('/deliveries/:id', authenticateToken, (req, res) => {
    const query = `
        SELECT d.*, 
               u1.name as creator_name, 
               u2.name as courier_name,
               u2.username as courier_username
        FROM deliveries d
        LEFT JOIN users u1 ON d.creator_id = u1.id
        LEFT JOIN users u2 ON d.courier_id = u2.id
        WHERE d.id = ?
    `;
    db.get(query, [req.params.id], (err, row) => {
        if (err) return res.status(500).send(err.message);
        if (!row) return res.status(404).send('Dostawa nie znaleziona');

        db.all("SELECT * FROM delivery_items WHERE delivery_id = ?", [row.id], (err, items) => {
            if (err) return res.status(500).send(err.message);
            res.json({
                ...row,
                clientName: row.creator_name, // Map for frontend convenience
                items: items.map(i => ({ ...i, confirmed: !!i.confirmed }))
            });
        });
    });
});

// DELETE /deliveries/:id (Client deletes new order)
app.delete('/deliveries/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get("SELECT * FROM deliveries WHERE id = ?", [id], (err, delivery) => {
        if (!delivery) return res.status(404).send('Not found');
        if (delivery.creator_id !== userId && req.user.role !== 'admin') return res.status(403).send('Brak uprawnień');
        if (delivery.status !== 'new') return res.status(400).send('Można usunąć tylko nowe, nieprzypisane zamówienia.');

        db.run("DELETE FROM delivery_items WHERE delivery_id = ?", [id], (err) => {
            db.run("DELETE FROM deliveries WHERE id = ?", [id], (err) => {
                res.json({ message: 'Zamówienie usunięte.' });
            });
        });
    });
});

// PATCH /deliveries/:id/unassign (Courier abandons order)
app.patch('/deliveries/:id/unassign', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get("SELECT * FROM deliveries WHERE id = ?", [id], (err, delivery) => {
        if (!delivery) return res.status(404).send('Not found');
        if (delivery.courier_id !== userId && req.user.role !== 'admin') return res.status(403).send('Brak uprawnień');

        // Check if any items are already delivered
        db.get("SELECT SUM(delivered_quantity) as total_delivered FROM delivery_items WHERE delivery_id = ?", [id], (err, row) => {
            if (row && row.total_delivered > 0) {
                return res.status(400).send('Nie można zrezygnować z zamówienia, które jest w trakcie realizacji (dostarczono już część towaru).');
            }

            const timestamp = new Date().toLocaleString('pl-PL');
            const noteToAppend = `\n[${timestamp}] [SYSTEM]: Kurier ${req.user.name} zrezygnował z realizacji.`;

            db.run("UPDATE deliveries SET courier_id = NULL, status = 'new', notes = COALESCE(notes, '') || ? WHERE id = ?", [noteToAppend, id], (err) => {
                res.json({ message: 'Zrezygnowano z zamówienia. Wróciło ono do puli.' });
            });
        });
    });
});

// POST /deliveries (Create - for Clients) - keeping existing code here just as anchor if needed, but tool replaces range.
// Wait, I am inserting BEFORE POST /deliveries? Or replacing it to include these?
// The instruction implies adding new endpoints. I should insert them BEFORE or AFTER POST /deliveries.
// Let's insert them BEFORE 'POST /deliveries'.
// Wait, the ReplacementContent contains `POST /deliveries`? No.
// I will target the space before `POST /deliveries` or replace `POST /deliveries` block entirely adding these above it.
// I'll replace `// POST /deliveries (Create - for Clients)` line and add these endpoints before it.
// Actually, `server.js` lines 145 is the comment.
// I'll insert before line 145.
// Ah, `replace_file_content` replaces a range.
// Let's create a specialized MultiReplace or just replace the `POST /deliveries` comment line with the new code + the comment line.
// But better: Add them AFTER the existing `GET /deliveries/:id` block (ends line 143) and BEFORE `POST /deliveries` (line 145).

app.post('/deliveries', authenticateToken, (req, res) => {
    const { address, date, items, notes } = req.body; // items: [{name, quantity}]
    const creator_id = req.user.id;
    const deliveryNumber = 'DEL-' + Date.now();
    const status = 'new';

    // Calculate Estimated Date (Date + 1 Day)
    const orderDate = new Date();
    const estimated = new Date(orderDate);
    estimated.setDate(estimated.getDate() + 1);
    const estimated_date = estimated.toLocaleDateString('pl-PL'); // Save as string

    // Always add creation system note
    const timestamp = new Date().toLocaleString('pl-PL');
    let formattedNotes = `[${timestamp}] [KLIENT]: UTWORZONO zamówienie.`;

    if (notes && notes.trim() !== '') {
        formattedNotes += `\n[${timestamp}] [KLIENT]: ${notes}`;
    }

    db.run(`INSERT INTO deliveries (deliveryNumber, date, address, status, notes, creator_id, estimated_date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [deliveryNumber, date, address, status, formattedNotes, creator_id, estimated_date],
        function (err) {
            if (err) return res.status(500).send(err.message);
            const deliveryId = this.lastID;

            if (items && items.length > 0) {
                const placeholders = items.map(() => '(?, ?, ?, 0)').join(',');
                const values = items.flatMap(i => [deliveryId, i.name, i.quantity]);
                db.run(`INSERT INTO delivery_items (delivery_id, name, quantity, confirmed) VALUES ${placeholders}`, values, (err) => {
                    if (err) console.error("Error inserting items", err);
                });
            }
            res.json({ message: 'Dostawa utworzona', id: deliveryId });
        }
    );
});

// PATCH /deliveries/:id/assign (For Courier to pick up, or Admin to assign)
app.patch('/deliveries/:id/assign', authenticateToken, (req, res) => {
    // If courier calls this, they assign to themselves if it's 'new'
    const { id } = req.params;
    const userId = req.user.id;

    db.get("SELECT * FROM deliveries WHERE id = ?", [id], (err, delivery) => {
        if (!delivery) return res.status(404).send('Not found');

        if (delivery.status !== 'new') return res.status(400).send('Dostawa już przypisana lub zakończona');

        const timestamp = new Date().toLocaleString('pl-PL');
        const noteToAppend = `\n[${timestamp}] [KURIER]: Przyjęto do realizacji.`;

        db.run("UPDATE deliveries SET courier_id = ?, status = 'assigned', notes = COALESCE(notes, '') || ? WHERE id = ?", [userId, noteToAppend, id], (err) => {
            if (err) return res.status(500).send(err.message);
            res.json({ message: 'Dostawa przypisana' });
        });
    });
});

// PATCH /items (Update confirmation / pending quantities)
app.patch('/deliveries/:id/items', authenticateToken, (req, res) => {
    const { items } = req.body; // [{id, pending_quantity}]

    // Items array contains {id, pending_quantity} now.
    // Logic: Courier says "I am delivering X amount now".
    // We set this X as pending_quantity.

    const stmt = db.prepare("UPDATE delivery_items SET pending_quantity = ? WHERE id = ?");
    items.forEach(item => {
        // Validation?
        stmt.run(item.pending_quantity || 0, item.id);
    });
    stmt.finalize();

    res.json({ message: 'Items updated with pending quantities' });
});

// POST /complete
app.post('/deliveries/:id/complete', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status: explicitStatus, notes } = req.body;

    // Courier finishes -> Status becomes 'waiting_for_client'.
    const newStatus = 'waiting_for_client';

    let query = "UPDATE deliveries SET status = ?";
    let params = [newStatus];

    // Always append system note for delivery report
    const timestamp = new Date().toLocaleString('pl-PL');
    let noteToAppend = `\n[${timestamp}] [KURIER]: Zgłoszono dostarczenie.`;

    if (notes && notes.trim() !== '') {
        noteToAppend += `\n[${timestamp}] [KURIER]: ${notes}`;
    }

    query += ", notes = COALESCE(notes, '') || ?";
    params.push(noteToAppend);

    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Dostawa oczekuje na potwierdzenie klienta' });
    });
});

// PATCH /deliveries/:id/estimated-date (Update estimated date)
app.patch('/deliveries/:id/estimated-date', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    // Authorization check could be added here (only courier assigned or admin)

    db.run("UPDATE deliveries SET estimated_date = ? WHERE id = ?", [date, id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Zaktualizowano przewidywaną datę dostawy' });
    });
});

// Client Confirm Endpoint
app.post('/deliveries/:id/client-confirm', authenticateToken, (req, res) => {
    const { id } = req.params;

    // 1. Get all items.
    // 2. Add pending to delivered.
    // 3. Reset pending to 0.
    // 4. Check if fully delivered.

    db.all("SELECT * FROM delivery_items WHERE delivery_id = ?", [id], (err, items) => {
        if (err) return res.status(500).send(err.message);

        let isFullyDelivered = true;
        const updateStmt = db.prepare("UPDATE delivery_items SET delivered_quantity = ?, pending_quantity = 0 WHERE id = ?");

        items.forEach(item => {
            const newDelivered = item.delivered_quantity + item.pending_quantity;
            if (newDelivered < item.quantity) {
                isFullyDelivered = false;
            }
            updateStmt.run(newDelivered, item.id);
        });
        updateStmt.finalize();

        // 5. Update Delivery Status
        // If not full, status -> 'assigned' (so courier can deliver rest) OR maybe 'delivered_partial' but active?
        // User requested: "mozliwosc zglaszania dostarczenia w czesciach".
        // If status remains 'assigned', courier sees it in 'My Deliveries'.
        // If status 'delivered', it's done.
        const newStatus = isFullyDelivered ? 'delivered' : 'assigned';

        // Append system note for confirmation
        const timestamp = new Date().toLocaleString('pl-PL');
        const statusMsg = isFullyDelivered ? 'Potwierdzono odbiór (CAŁOŚĆ).' : 'Potwierdzono odbiór (CZĘŚCIOWY).';
        const noteToAppend = `\n[${timestamp}] [KLIENT]: ${statusMsg}`;

        db.run("UPDATE deliveries SET status = ?, notes = COALESCE(notes, '') || ? WHERE id = ?", [newStatus, noteToAppend, id], (err) => {
            if (err) return res.status(500).send(err.message);
            res.json({ message: isFullyDelivered ? 'Dostawa zakończona.' : 'Potwierdzono odbiór częściowy. Dostawa nadal w realizacji.' });
        });
    });
});

// Client Report Problem Endpoint
app.post('/deliveries/:id/report-problem', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    let query = "UPDATE deliveries SET status = 'disputed'";
    let params = [];

    if (notes && notes.trim() !== '') {
        const timestamp = new Date().toLocaleString('pl-PL');
        const noteToAppend = `\n[${timestamp}] [KLIENT] (PROBLEM): ${notes}`;
        query += ", notes = COALESCE(notes, '') || ?";
        params.push(noteToAppend);
    }

    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Zgłoszono problem z dostawą' });
    });
});

// Courier Resolve Problem Endpoint
app.post('/deliveries/:id/resolve-problem', authenticateToken, (req, res) => {
    const { id } = req.params;
    // Should check if courier is the assignee

    // Reset status to waiting_for_client to allow re-confirmation or re-dispute
    db.run("UPDATE deliveries SET status = 'waiting_for_client' WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Problem oznaczony jako rozwiązany. Oczekiwanie na klienta.' });
    });
});

// Admin Users Endpoint
app.get('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    db.all("SELECT id, username, name, role, is_active FROM users", (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Admin Deactivate User Endpoint
app.patch('/users/:id/deactivate', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;

    // Prevent deactivating self
    if (parseInt(id) === req.user.id) return res.status(400).send('Nie możesz zablokować swojego konta.');

    db.run("UPDATE users SET is_active = 0 WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Użytkownik zablokowany.' });
    });
});

// Admin Reactivate User Endpoint
app.patch('/users/:id/reactivate', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { id } = req.params;

    db.run("UPDATE users SET is_active = 1 WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err.message);
        res.json({ message: 'Użytkownik odblokowany.' });
    });
});

// Admin Stats Endpoint
app.get('/stats', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);

    const stats = {};

    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'client'", (err, row) => {
        stats.clients = row.count;
        db.get("SELECT COUNT(*) as count FROM users WHERE role = 'courier'", (err, row) => {
            stats.couriers = row.count;
            db.get("SELECT COUNT(*) as count FROM users WHERE role = 'client' AND is_active = 0", (err, row) => {
                stats.blockedClients = row.count;
                db.get("SELECT COUNT(*) as count FROM users WHERE role = 'courier' AND is_active = 0", (err, row) => {
                    stats.blockedCouriers = row.count;
                    db.get("SELECT COUNT(*) as count FROM deliveries", (err, row) => {
                        stats.deliveriesTotal = row.count;
                        db.get("SELECT COUNT(*) as count FROM deliveries WHERE status = 'delivered'", (err, row) => {
                            stats.deliveriesDelivered = row.count;
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Network access: http://172.30.174.52:${PORT}`);
});
