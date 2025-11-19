package com.shop.commerce_api.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class ImageUploadService {

    private final Cloudinary cloudinary;

    public ImageUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "File is empty");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "ecommerce/products"  // optional folder
                    )
            );

            Object url = result.get("secure_url");
            if (url == null) {
                throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Upload failed");
            }
            return url.toString();

        } catch (IOException e) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Image upload failed", e);
        }
    }
}
