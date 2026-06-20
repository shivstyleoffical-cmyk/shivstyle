import { v2 as cloudinary } from 'cloudinary';
import StorageService from './storage.service.interface.js';

class CloudinaryService extends StorageService {
    constructor() {
        super();
        this.isConfigured = false;
        this.configure();
    }

    configure() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName.trim(),
                api_key: apiKey.trim(),
                api_secret: apiSecret.trim()
            });
            this.isConfigured = true;
        } else {
            console.warn('⚠️ Cloudinary not configured! Image uploads will fail.');
        }
    }

    async upload(buffer, folder = 'ecommerce', publicId = null) {
        if (!this.isConfigured) this.configure();

        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            };

            if (publicId) uploadOptions.public_id = publicId;

            // Using upload_stream for buffers
            const stream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    }
                    resolve({
                        success: true,
                        url: result.secure_url,
                        public_id: result.public_id,
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes
                    });
                }
            );

            stream.end(buffer);
        });
    }

    async delete(publicId) {
        if (!this.isConfigured) this.configure();

        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return {
                success: result.result === 'ok',
                result: result
            };
        } catch (error) {
            throw new Error(`Cloudinary delete failed: ${error.message}`);
        }
    }

    extractPublicIdFromUrl(url) {
        try {
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];
            return filename.split('.')[0];
        } catch (error) {
            return null;
        }
    }
}

export default new CloudinaryService();
