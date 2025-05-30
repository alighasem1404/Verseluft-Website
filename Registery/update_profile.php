
<?php
include("config.php");
session_start();
$user_id = $_SESSION["user_id"];
$select = mysqli_query($conn,"SELECT * FROM `user_form` WHERE id = '$user_id'") or die('query failed');
        if(mysqli_num_rows($select) > 0){
            $fetch = mysqli_fetch_assoc($select);
        }

if(isset($_POST['update_profile'])){
    $update_name = mysqli_real_escape_string($conn, $_POST['update_name']);
    $update_email = mysqli_real_escape_string($conn, $_POST['update_email']);
    
    mysqli_query($conn, "UPDATE `user_form` SET name = '$update_name', email = '$update_email' WHERE id = '$user_id'") or die('query failed');

    $old_pass = $_POST['old_pass'];
   $update_pass = mysqli_real_escape_string($conn, md5($_POST['update_pass']));
   $new_pass = mysqli_real_escape_string($conn, md5($_POST['new_pass']));
   $confirm_pass = mysqli_real_escape_string($conn, md5($_POST['confirm_pass']));

   if(!empty($update_pass) || !empty($new_pass) || !empty($confirm_pass)){
      if($update_pass != $old_pass){
         $message[] = 'old password not matched!';
      }elseif($new_pass != $confirm_pass){
         $message[] = 'confirm password not matched!';
      }else{
         mysqli_query($conn, "UPDATE `user_form` SET password = '$confirm_pass' WHERE id = '$user_id'") or die('query failed');
         $message[] = 'password updated successfully!';
      }
   }

   $update_image = $_FILES['update_image']['name'];
   $update_image_size = $_FILES['update_image']['size'];
   $update_image_tmp_name = $_FILES['update_image']['tmp_name'];
   
   // Get file extension
   $file_extension = strtolower(pathinfo($update_image, PATHINFO_EXTENSION));
   // Get username and create new filename
   $username = $fetch['name']; // Using the username from database
   $new_filename = $username . '_avatar.' . $file_extension;
   $update_image_folder = 'uploaded_img/' . $new_filename;
   
   if(!empty($update_image)){
       if($update_image_size > 2000000){
           $message[] = 'image size is too large!';
       }else{
           // Update database with new filename
           $update_image_query = mysqli_query($conn, "UPDATE `user_form` SET image = '$new_filename' WHERE id = '$user_id'") or die('query failed');
           if($update_image_query){
               move_uploaded_file($update_image_tmp_name, $update_image_folder);
               $message[] = 'image updated successfully!';
           }else{
               $message[] = 'image update failed!';
           }
       }
   }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>update profile</title>

    <!-- css link  -->
    <link rel="stylesheet" href="stylesRegistery.css">
</head>
<body>
    <div class="update-profile">
        <?php
        
        
        ?>
        <form action="" method="post" enctype="multipart/form-data">
            <?php
            if($fetch['image'] == ''){
                echo '<img src="images/default-avatar.png">';
            }else{
                echo '<img src="uploaded_img/'.$fetch['image'].'">';
            }
            
            if(isset($message)){
                foreach($message as $message){
                    echo '<div class="message">'.$message.'</div>';
                }
            }
        
            ?>
            <div class="flex">
                <div class="inputBox">
                    <span>username :</span>
                    <input type="text" name="update_name" value="<?php echo $fetch['name'];?>" class="box">
               
                    <span>your email :</span>
                    <input type="email" name="update_email" value="<?php echo $fetch['email'];?>" class="box">
                    <span> uopdate your image :</span>
                    <input type="file" name="update_image" accept="image/png, image/jpeg, image/jpg" class="box">
                    
                </div>
                <div class="inputBox">
                    <input type="hidden" name="old_pass" value="<?php echo $fetch['password'];?>">
                    <span>old password :</span>
                    <input type="password" name="update_pass" placeholder="enter old password" class="box">
                    <span>new password :</span>
                    <input type="password" name="new_pass" placeholder="enter new password" class="box">
                    <span>confirm password :</span>
                    <input type="password" name="confirm_pass" placeholder="confirm new password" class="box">
                </div>


                
                
                
            </div>
            <input type="submit" name="update_profile" value="update profile" class="btn">
            <a href="home.php" class="delete-btn">go back</a>
        </form>
    </div>
</body>
</html>