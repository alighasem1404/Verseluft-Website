<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the JSON data from the request body
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data: ' . json_last_error_msg()]);
    exit;
}

// Define the path to the JSON file
$jsonFile = dirname(__DIR__) . '/slider-data.json';

// Check if the file is writable
if (!is_writable(dirname($jsonFile))) {
    http_response_code(500);
    echo json_encode(['error' => 'Directory is not writable: ' . dirname($jsonFile)]);
    exit;
}

// Try to save the file
$result = file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));

if ($result === false) {
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to save file',
        'details' => $error ? $error['message'] : 'Unknown error',
        'path' => $jsonFile
    ]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'File saved successfully']);
?> 