class Photo {
        constructor(data) {
                this.id = data.id;
                this.title = data.title;
                this.caption = data.caption;
                this.uploadDate = data.upload_date;
                this.imageSrc = data.image_src; // match DB column name
                this.placeholderSrc = data.placeholder_src;
                this.owner = data.account_id;
        }

        static tableName = "photos";

        static async getAllRows(db, isRandomOrder = true) {
                const sql = `SELECT * FROM ${this.tableName} ${isRandomOrder ? "ORDER BY RANDOM()" : ""}`;
                const result = await db.query(sql);
                return result.rows;
        }

        static async findById(db, id) {
                const sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
                const result = await db.query(sql, [id]); 
                return result.rows[0] || null;
        }

        static async insertPhoto(db, id, title, caption, imageSrc, placeholderSrc) {
                const sql = `INSERT INTO ${this.tableName} 
            (id, title, caption, image_src, placeholder_src)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`; 
                const values = [id, title && title.trim() ? title : null, caption && caption.trim() ? caption : null, imageSrc, placeholderSrc];
                const result = await db.query(sql, values);
                return result.rows[0] || null;
        }

        static async deletePhoto(db, id) {
                const sql = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
                const result = await db.query(sql, [id]); 
                return result.rows[0] || null;
        }

        static async editPhoto(db, id, title, caption) {
                const sql = `UPDATE ${this.tableName} 
            SET title = $1, caption = $2 
            WHERE id = $3 RETURNING *`;
                const result = await db.query(sql, [title, caption, id]);
                return result.rows[0] || null;
        }
}

module.exports = Photo;
