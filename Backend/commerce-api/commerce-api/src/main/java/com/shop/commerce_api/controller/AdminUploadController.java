package com.shop.commerce_api.controller;

import com.shop.commerce_api.service.ImageUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/upload")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUploadController {

    private final ImageUploadService imageUploadService;

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    public AdminUploadController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestPart("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file uploaded");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File exceeds 10 MB");
        }

        if (!file.getContentType().startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files allowed");
        }

        // OPTIONAL: Validate image shape
        BufferedImage img = ImageIO.read(file.getInputStream());
        if (img == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image file");
        }

        // Upload to Cloudinary
        String uploadedUrl = imageUploadService.uploadProductImage(file);

        Map<String, String> response = new HashMap<>();
        response.put("url", uploadedUrl);

        return ResponseEntity.ok(response);
    }
}
