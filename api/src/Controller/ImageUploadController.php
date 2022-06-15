<?php

namespace App\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * @IsGranted("ROLE_USER")
 * @IsGranted("data-privacy-accepted")
 * @IsGranted("terms-of-use-accepted")
 */
class ImageUploadController extends AbstractController
{
  /**
   * List of supported files extensions
   * HINT: Should match client side "CustomCKEditor.defaultConfig.image.upload.types"
   */
  const SUPPORTED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'webp', 'png', 'gif', 'bmp'];

  /**
   * Action responsible for uploading images.
   * If successful the response will contain the public URL to the image.
   *
   * @Route("/images", name="images", methods={"POST"})
   *
   * @return Response with JSON encoded content:
   *   in case of success return:
   *     {
   *       "url": "<url-to-image>"
   *     }
   *
   *   in case of failure return:
   *     {
   *       "error": {
   *         "message": "The image upload failed because the image was too big (max 1.5MB)."
   *       }
   *     }
   */
  public function uploadImage(Request $request, SluggerInterface $slugger): Response
  {
    /**
     * @var UploadedFile
     */
    $uploadedFile = $request->files->get('upload');
    $fileExtension = $uploadedFile->guessExtension();

    // return error when file extension is wrong
    if (!in_array(strtolower($fileExtension), self::SUPPORTED_IMAGE_EXTENSIONS)) {
      $supportedExtensions = implode(", ", self::SUPPORTED_IMAGE_EXTENSIONS);

      $error = json_encode([
        "error" => [
          "message" => "Fehler: Nur Bilder mit Dateiendungen '$supportedExtensions' erlaubt."
        ]
      ]);

      return new Response($error, 400);
    }

    $originalFileName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
    // Make sure that the file name can be safely included inside an URL
    $safeFileName = $slugger->slug($originalFileName);
    $newFilename = $safeFileName . '-' . uniqid() . '.' . $fileExtension;

    try {
      // NOTE: The directory path for "uploaded_images_dir" is configured inside config/services.yaml
      $uploadedFile->move($this->getParameter('uploaded_images_dir'), $newFilename);

      $baseURL = $request->getBaseUrl();

      $responseContent = json_encode(["url" => "$baseURL/uploads/images/$newFilename"]);

      return new Response($responseContent, 201);
    } catch (FileException $e) {
      $error = json_encode(["error" => ["message" => $e->getMessage()]]);

      return new Response($error, 400);
    }
  }
}
