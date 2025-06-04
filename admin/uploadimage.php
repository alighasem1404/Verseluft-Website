<?php
header('Content-Type: application/json'); // Set header to return JSON response

$uploadDir = '../images/'; // Target directory for uploads

// Check if the upload directory exists and is writable
if (!is_dir($uploadDir)) {
    // Attempt to create the directory if it doesn't exist
    if (!mkdir($uploadDir, 0755, true)) {
        echo json_encode(['success' => false, 'message' => 'Upload directory does not exist and could not be created.']);
        exit;
    }
} elseif (!is_writable($uploadDir)) {
    echo json_encode(['success' => false, 'message' => 'Upload directory is not writable. Please check permissions.']);
    exit;
}

// Check if a file was uploaded
if (isset($_FILES['imageFile']) && $_FILES['imageFile']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['imageFile'];

    $fileName = basename($file['name']); // Get original filename
    $fileTmpName = $file['tmp_name'];   // Temporary file path
    $fileSize = $file['size'];         // File size in bytes
    $fileType = $file['type'];         // File MIME type
    $fileError = $file['error'];       // Upload error code

    // Get file extension
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Allowed file extensions
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    // Validate file extension
    if (!in_array($fileExt, $allowedExtensions)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.']);
        exit;
    }

    // Validate file size (e.g., max 5MB)
    $maxFileSize = 5 * 1024 * 1024; // 5 MB
    if ($fileSize > $maxFileSize) {
        echo json_encode(['success' => false, 'message' => 'File size exceeds the maximum limit (5MB).']);
        exit;
    }

    // *** CHANGE: Use the original filename instead of generating a unique one ***
    $newFileName = $fileName;
    $destination = $uploadDir . $newFileName;

    // IMPORTANT: Check if a file with the same name already exists
    if (file_exists($destination)) {
        echo json_encode(['success' => false, 'message' => 'A file with this name already exists. Please rename your file or upload a different one.']);
        exit;
    }

    // Move the uploaded file from temporary location to the target directory
    if (move_uploaded_file($fileTmpName, $destination)) {
        echo json_encode(['success' => true, 'message' => 'Image uploaded successfully!', 'filePath' => $destination]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
    }
} else {
    // Handle specific upload errors
    switch ($_FILES['imageFile']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $message = 'The uploaded file exceeds the maximum file size allowed.';
            break;
        case UPLOAD_ERR_PARTIAL:
            $message = 'The uploaded file was only partially uploaded.';
            break;
        case UPLOAD_ERR_NO_FILE:
            $message = 'No file was uploaded. Please select a file.';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $message = 'Missing a temporary folder.';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $message = 'Failed to write file to disk.';
            break;
        case UPLOAD_ERR_EXTENSION:
            $message = 'A PHP extension stopped the file upload.';
            break;
        default:
            $message = 'An unknown upload error occurred.';
            break;
    }
    echo json_encode(['success' => false, 'message' => $message]);
}
?>
