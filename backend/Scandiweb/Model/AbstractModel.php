<?php

namespace Scandiweb\Model;

use Scandiweb\Database\Database;

abstract class AbstractModel
{
    protected array $data = [];
    protected Database $database;

    public function __construct(array $data = [])
    {
        $this->data = $data;
        $this->database = Database::getInstance();
    }

    abstract public function getTableName(): string;

    abstract public function getPrimaryKey(): string;

    public function getId(): mixed
    {
        return $this->data[$this->getPrimaryKey()] ?? null;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = array_merge($this->data, $data);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->data[$key] ?? $default;
    }

    public function set(string $key, $value): void
    {
        $this->data[$key] = $value;
    }

    public function save(): bool
    {
        $conn = $this->database->getConnection();

        if ($this->getId()) {
            // Update existing record
            $fields = array_keys($this->data);
            // Exclude auto-managed fields from updates
            $fields = array_filter($fields, fn($field) => !in_array($field, ['id', 'created_at']));
            
            if (empty($fields)) {
                return true; // Nothing to update
            }
            
            $setClause = implode(', ', array_map(fn($field) => "$field = :$field", $fields));
            $sql = "UPDATE {$this->getTableName()} SET $setClause WHERE {$this->getPrimaryKey()} = :id";

            $stmt = $conn->prepare($sql);
            $params = array_intersect_key($this->data, array_flip($fields));
            $params['id'] = $this->getId();

            return $stmt->execute($params);
        } else {
            // Insert new record
            $fields = array_keys($this->data);
            // Exclude auto-managed fields from inserts
            $fields = array_filter($fields, fn($field) => !in_array($field, ['id', 'created_at', 'updated_at']));
            
            if (empty($fields)) {
                return false; // No fields to insert
            }
            
            $placeholders = implode(', ', array_map(fn($field) => ":$field", $fields));
            $fieldList = implode(', ', $fields);
            $sql = "INSERT INTO {$this->getTableName()} ($fieldList) VALUES ($placeholders)";

            $stmt = $conn->prepare($sql);
            $params = array_intersect_key($this->data, array_flip($fields));
            $result = $stmt->execute($params);

            if ($result && $this->getPrimaryKey() === 'id') {
                $this->data['id'] = $conn->lastInsertId();
            }

            return $result;
        }
    }

    public function delete(): bool
    {
        if (!$this->getId()) {
            return false;
        }

        $conn = $this->database->getConnection();
        $sql = "DELETE FROM {$this->getTableName()} WHERE {$this->getPrimaryKey()} = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute(['id' => $this->getId()]);
    }

    public static function findById($id): ?static
    {
        $instance = new static();
        $conn = $instance->database->getConnection();

        $sql = "SELECT * FROM {$instance->getTableName()} WHERE {$instance->getPrimaryKey()} = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute(['id' => $id]);

        $data = $stmt->fetch();
        if (!$data) {
            return null;
        }

        return new static($data);
    }

    public static function findAll(array $conditions = [], array $orderBy = [], int|null $limit = null): array
    {
        $instance = new static();
        $conn = $instance->database->getConnection();

        $sql = "SELECT * FROM {$instance->getTableName()}";
        $params = [];

        if (!empty($conditions)) {
            $whereClause = implode(' AND ', array_map(fn($field) => "$field = :$field", array_keys($conditions)));
            $sql .= " WHERE $whereClause";
            $params = $conditions;
        }

        if (!empty($orderBy)) {
            $orderClause = implode(', ', array_map(fn($field, $direction) => "$field $direction", array_keys($orderBy), $orderBy));
            $sql .= " ORDER BY $orderClause";
        }

        if ($limit) {
            $sql .= " LIMIT $limit";
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        $results = [];
        while ($data = $stmt->fetch()) {
            $results[] = new static($data);
        }

        return $results;
    }
} 