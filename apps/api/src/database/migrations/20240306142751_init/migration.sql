-- CreateTable
CREATE TABLE `house_price_index` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `index` DOUBLE NOT NULL,
    `detached_index` DOUBLE NULL,
    `semi_detached_index` DOUBLE NULL,
    `terraced_index` DOUBLE NULL,
    `flat_index` DOUBLE NULL,

    INDEX `date`(`date`),
    INDEX `region`(`region`),
    UNIQUE INDEX `unique`(`date`, `region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `price` INTEGER NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'SOLD_STC', 'UNDER_OFFER', 'COMPLETED', 'PENDING', 'REVIEW', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `terms_accepted_at` DATETIME(3) NULL,
    `featuredImageId` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `listings_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `payment_intent_id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `listing_id` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_id_key`(`id`),
    UNIQUE INDEX `payments_payment_intent_id_key`(`payment_intent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postcodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postcode` VARCHAR(20) NOT NULL,
    `area` VARCHAR(5) NOT NULL,
    `district` VARCHAR(10) NOT NULL,
    `latitude` DECIMAL(12, 8) NOT NULL,
    `longitude` DECIMAL(12, 8) NOT NULL,
    `region_name` VARCHAR(100) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `postcodes_postcode_key`(`postcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `fingerprint` VARCHAR(191) NOT NULL,
    `paon` VARCHAR(191) NOT NULL,
    `saon` VARCHAR(191) NULL,
    `street` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `type` ENUM('HOUSE', 'FLAT', 'BUNGALOW', 'MAISONETTE', 'COTTAGE', 'PARK_HOME') NULL,
    `detachment` ENUM('DETACHED', 'SEMI_DETACHED', 'END_TERRACE', 'MID_TERRACE') NULL,
    `tenure` ENUM('FREEHOLD', 'LEASEHOLD') NULL,
    `habitable_rooms` INTEGER NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `latitude` DECIMAL(12, 8) NULL,
    `longitude` DECIMAL(12, 8) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `properties_id_key`(`id`),
    UNIQUE INDEX `properties_fingerprint_key`(`fingerprint`),
    INDEX `properties_existing`(`paon`, `saon`, `street`, `postcode`),
    INDEX `properties_existing_no_saon`(`paon`, `street`, `postcode`),
    INDEX `properties_postcode`(`postcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_epcs` (
    `lmk` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `potential_energy_rating` VARCHAR(191) NOT NULL,
    `current_energy_rating` VARCHAR(191) NOT NULL,
    `potential_energy_efficiency` DOUBLE NOT NULL,
    `current_energy_efficiency` DOUBLE NOT NULL,
    `built_form` ENUM('DETACHED', 'SEMI_DETACHED', 'END_TERRACE', 'MID_TERRACE') NOT NULL,
    `property_type` ENUM('HOUSE', 'FLAT', 'BUNGALOW', 'MAISONETTE', 'COTTAGE', 'PARK_HOME') NOT NULL,
    `potential_environmental_impact` DOUBLE NOT NULL,
    `current_environmental_impact` DOUBLE NOT NULL,
    `mains_gas` BOOLEAN NOT NULL,
    `habitable_rooms` INTEGER NOT NULL,
    `total_floor_area` DOUBLE NOT NULL,
    `total_floor_sqft` DOUBLE NOT NULL,
    `lodged_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_epcs_lmk_key`(`lmk`),
    UNIQUE INDEX `property_epcs_property_id_key`(`property_id`),
    PRIMARY KEY (`lmk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_floors` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `type` ENUM('BASEMENT', 'GROUND', 'FIRST', 'SECOND', 'THIRD') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_floors_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_images` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `room_id` VARCHAR(191) NULL,
    `path` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_images_id_unique`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_rooms` (
    `id` VARCHAR(191) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `floor_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('BEDROOM', 'BATHROOM', 'KITCHEN', 'LIVING_ROOM', 'DINING_ROOM', 'STUDY', 'UTILITY_ROOM', 'GARAGE', 'CELLAR', 'CONSERVATORY', 'MEDIA_ROOM', 'GYM', 'POOL', 'LIBRARY', 'STORAGE', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `ensuite` BOOLEAN NULL,
    `length` DOUBLE NULL,
    `width` DOUBLE NULL,
    `height` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_rooms_id_unique`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_transaction_history` (
    `tuid` VARCHAR(50) NOT NULL,
    `property_id` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `postcode` VARCHAR(10) NOT NULL,
    `paon` VARCHAR(191) NOT NULL,
    `saon` VARCHAR(191) NULL,
    `street` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `city` VARCHAR(191) NULL,

    UNIQUE INDEX `property_transaction_history_tuid_unique`(`tuid`),
    INDEX `city`(`city`),
    INDEX `postcode`(`postcode`),
    INDEX `property_idx`(`property_id`),
    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_valuations` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('AREA', 'INDIVIDUAL') NOT NULL DEFAULT 'INDIVIDUAL',
    `property_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `valuation` INTEGER NOT NULL,
    `valuation_last_month` INTEGER NULL,
    `postcode` VARCHAR(10) NOT NULL,
    `region` VARCHAR(100) NULL,
    `tuids_used` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `property_valuations_id_unique`(`id`),
    INDEX `property_idx`(`property_id`),
    INDEX `user_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_access_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_access_tokens_id_unique`(`id`),
    UNIQUE INDEX `user_access_tokens_tokenx`(`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_login_history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_login_history_id_unique`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_magic_links` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `next` VARCHAR(191) NULL,
    `code` VARCHAR(191) NOT NULL,
    `client_code` VARCHAR(191) NOT NULL,
    `redeemed_at` DATETIME(3) NULL,
    `redeemed_ip` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_magic_links_id_unique`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `accepts_marketing` BOOLEAN NOT NULL DEFAULT false,
    `initial_type` ENUM('BUYER', 'SELLER') NULL,
    `last_used_type` ENUM('BUYER', 'SELLER') NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_id_unique`(`id`),
    UNIQUE INDEX `users_email_idx`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_epcs` ADD CONSTRAINT `property_epcs_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_floors` ADD CONSTRAINT `property_floors_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_images` ADD CONSTRAINT `property_images_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `property_rooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_rooms` ADD CONSTRAINT `property_rooms_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_rooms` ADD CONSTRAINT `property_rooms_floor_id_fkey` FOREIGN KEY (`floor_id`) REFERENCES `property_floors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_transaction_history` ADD CONSTRAINT `property_transaction_history_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_valuations` ADD CONSTRAINT `property_valuations_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_valuations` ADD CONSTRAINT `property_valuations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_access_tokens` ADD CONSTRAINT `user_access_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_login_history` ADD CONSTRAINT `user_login_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_magic_links` ADD CONSTRAINT `user_magic_links_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
