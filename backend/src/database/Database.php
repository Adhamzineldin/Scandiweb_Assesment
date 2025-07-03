<?php

class Database
{
    private static ?Database $instance = null;
    private ?PDO $conn = null;

    private function __construct()
    {
        $this->loadEnv();
        // 🔁 Removed connect() from constructor
    }

    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        // ⏳ Lazy connect on first use
        if ($this->conn === null) {
            $this->connect();
        }

        return $this->conn;
    }

    private function loadEnv(): void
    {
        $envPath = dirname(__DIR__, 2);
        if (!getenv('DB_HOST')) {
            $dotenv = Dotenv::createImmutable($envPath);
            $dotenv->load();
            $dotenv->required(['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS']);
        }
    }

    private function connect(): void
    {
        try {
            $host = getenv('DB_HOST');
            $port = getenv('DB_PORT') ?: '3306';
            $db = getenv('DB_NAME');
            $user = getenv('DB_USER');
            $pass = getenv('DB_PASS');

            if (!$host || !$db || !$user || !$pass) {
                throw new Exception('Missing database environment variables');
            }

            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log('DB connection error: ' . $e->getMessage());
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }
}
