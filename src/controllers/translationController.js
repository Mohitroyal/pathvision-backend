const pool = require('../config/db');

exports.getAllTranslations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM translations ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createTranslation = async (req, res) => {
    const { original_text, translated_text, source_language, target_language } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO translations (original_text, translated_text, source_language, target_language) VALUES ($1, $2, $3, $4) RETURNING *',
            [original_text, translated_text, source_language || 'Auto', target_language || 'English']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateTranslation = async (req, res) => {
    const { id } = req.params;
    const { translated_text } = req.body;
    try {
        const result = await pool.query(
            'UPDATE translations SET translated_text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [translated_text, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteTranslation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM translations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
