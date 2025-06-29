<?php
// Set the Content-Type header to application/json for the response
header('Content-Type: application/json');

// Initialize the response array
$response = ['success' => false, 'message' => ''];

// Define the path to your JSON file.
// IMPORTANT: Ensure this path is correct and the file/directory has write permissions (e.g., 644 or 777 depending on your server setup)
$json_file = '../nextProjectsData.json';

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the raw POST data, which should be the JSON string
    $json_data = file_get_contents('php://input');
    
    if ($json_data === false) {
        $response['message'] = 'Failed to read POST data.';
    } else {
        // Decode the JSON string into a PHP associative array
        $data = json_decode($json_data, true);

        // Check for JSON decoding errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            $response['message'] = 'Invalid JSON received: ' . json_last_error_msg();
        } else {
            // Basic validation for the expected JSON structure
            // Ensure it's an object and contains block1, block2, and block3
            if (!is_array($data) && !is_object($data) || !isset($data['block1']) || !isset($data['block2']) || !isset($data['block3'])) {
                $response['message'] = 'Invalid JSON structure. Expected an object with "block1", "block2", and "block3" properties.';
            } else {
                // Attempt to write the JSON data to the file
                // file_put_contents returns the number of bytes written or false on failure
                if (file_put_contents($json_file, $json_data) !== false) {
                    $response['success'] = true;
                    $response['message'] = 'Data saved successfully!';
                } else {
                    $response['message'] = 'Failed to write to file. Check file permissions for ' . $json_file . '.';
                }
            }
        }
    }
} else {
    $response['message'] = 'Invalid request method. Only POST is allowed.';
}

// Encode the response array into JSON and output it
echo json_encode($response);
?>
