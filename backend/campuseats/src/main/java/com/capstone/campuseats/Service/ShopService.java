package com.capstone.campuseats.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.capstone.campuseats.Entity.ShopEntity;
import com.capstone.campuseats.Repository.ShopRepository;
import com.capstone.campuseats.config.CustomException;

import jakarta.annotation.PostConstruct;

@Service
public class ShopService {
    private final ShopRepository shopRepository;

    @Value("${spring.cloud.azure.storage.blob.container-name}")
    private String containerName;

    @Value("${azure.blob-storage.connection-string}")
    private String connectionString;

    private BlobServiceClient blobServiceClient;

    @Autowired
    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    @PostConstruct
    public void init() {
        blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }

    public List<ShopEntity> getAllShops() {
        return shopRepository.findAll();
    }

    public Optional<ShopEntity> getShopById(String id) {
        return shopRepository.findById(id);
    }

    public ShopEntity createShop(ShopEntity shop, MultipartFile image, String userId) throws IOException {
        if (shopRepository.existsById(userId)) {
            throw new CustomException("Shop already exists.");
        }

        shop.setId(userId); // Set shopId to userId

        if (shop.getCreatedAt() == null) {
            shop.setCreatedAt(LocalDateTime.now());
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String formattedTimestamp = shop.getCreatedAt().format(formatter);
        System.out.println("timestamp: " + formattedTimestamp);

        String sanitizedShopName = shop.getName().replaceAll("[^a-zA-Z0-9-_\\.]", "_");

        String blobFilename = "shop/" + formattedTimestamp + "_" + sanitizedShopName;

        BlobClient blobClient = blobServiceClient
                .getBlobContainerClient(containerName)
                .getBlobClient(blobFilename);

        blobClient.upload(image.getInputStream(), image.getSize(), true);

        String imageUrl = blobClient.getBlobUrl();

        shop.setImageUrl(imageUrl);
        shop.setWallet(0);
        shop.setStatus("pending");
        shop.setCreatedAt(LocalDateTime.now());
        return shopRepository.save(shop);
    }

    public ShopEntity updateShop(String shopId, ShopEntity shop, MultipartFile image) throws IOException {
        Optional<ShopEntity> optionalShop = shopRepository.findById(shopId);
        if (optionalShop.isEmpty()) {
            throw new CustomException("Shop not found.");
        }

        ShopEntity existingShop = optionalShop.get();

        if (image != null) {
            // Format the timestamp
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String formattedTimestamp = LocalDateTime.now().format(formatter);
            System.out.println("timestamp: " + formattedTimestamp);
            // Sanitize shop name (optional)
            String sanitizedShopName = shop.getName().replaceAll("[^a-zA-Z0-9-_\\.]", "_");

            // Create the blob filename
            String blobFilename = "shop/" + formattedTimestamp + "_" + sanitizedShopName;

            BlobClient blobClient = blobServiceClient
                    .getBlobContainerClient(containerName)
                    .getBlobClient(blobFilename);

            blobClient.upload(image.getInputStream(), image.getSize(), true);

            String imageUrl = blobClient.getBlobUrl();
            existingShop.setImageUrl(imageUrl);
        }

        existingShop.setName(shop.getName());
        existingShop.setDesc(shop.getDesc());
        existingShop.setAddress(shop.getAddress());
        existingShop.setGoogleLink(shop.getGoogleLink());
        existingShop.setCategories(shop.getCategories());
        existingShop.setTimeOpen(shop.getTimeOpen());
        existingShop.setTimeClose(shop.getTimeClose());
        existingShop.setGcashName(shop.getGcashName());
        existingShop.setGcashNumber(shop.getGcashNumber());
        existingShop.setAcceptGCASH(shop.isAcceptGCASH());

        return shopRepository.save(existingShop);
    }

    public List<ShopEntity> getActiveShops() {
        return shopRepository.findByStatus("active");
    }

    public List<ShopEntity> getPendingShops() {
        return shopRepository.findByStatus("pending");
    }

    public List<ShopEntity> getNonPendingShops() {
        return shopRepository.findByStatusNot("pending");
    }

    public Map<String, List<ShopEntity>> getShopsList() {
        List<ShopEntity> pendingShops = getPendingShops();
        List<ShopEntity> nonPendingShops = getNonPendingShops();
        Map<String, List<ShopEntity>> shopsMap = new HashMap<>();
        shopsMap.put("pendingShops", pendingShops);
        shopsMap.put("nonPendingShops", nonPendingShops);
        return shopsMap;
    }

    public boolean updateShopStatus(String shopId, String status) {
        Optional<ShopEntity> shopOptional = shopRepository.findById(shopId);
        if (shopOptional.isPresent()) {
            ShopEntity shop = shopOptional.get();
            shop.setStatus(status);
            shopRepository.save(shop);
            return true;
        }
        return false;
    }

    public boolean updateShopDeliveryFee(String shopId, float deliveryFee) {
        Optional<ShopEntity> shopOptional = shopRepository.findById(shopId);
        if (shopOptional.isPresent()) {
            ShopEntity shop = shopOptional.get();
            shop.setDeliveryFee(deliveryFee);
            shopRepository.save(shop);
            return true;
        }
        return false;
    }

    public boolean updateShopWallet(String shopId, float totalPrice) {
        Optional<ShopEntity> shopOptional = shopRepository.findById(shopId);
        if (shopOptional.isPresent()) {
            ShopEntity shop = shopOptional.get();
            shop.setWallet(shop.getWallet() + totalPrice);
            shopRepository.save(shop);
            return true;
        }
        return false;
    }
}

// public ShopEntity updateShop(ShopEntity shop) {
// return shopRepository.save(shop);
//
// }