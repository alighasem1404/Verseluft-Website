const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        // Create a connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'user_db'
        });

        // Test the connection
        await connection.connect();
        console.log('Successfully connected to MySQL database!');

        // Test a simple query
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('\nTables in database:');
        console.table(rows);

        // Close the connection
        await connection.end();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

// Run the test
testConnection(); 