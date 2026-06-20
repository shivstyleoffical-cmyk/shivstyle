/**
 * Storage Service Interface
 * Abstract interface for file storage providers
 */
class StorageService {
    /**
     * Upload file
     * @param {Buffer} buffer - File buffer
     * @param {string} folder - Target folder
     * @param {string} publicId - Optional custom ID
     * @returns {Promise<Object>} - Upload result { url, publicId }
     */
    async upload(buffer, folder, publicId) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete file
     * @param {string} publicId - File identifier
     * @returns {Promise<boolean>} - Success status
     */
    async delete(publicId) {
        throw new Error('Method not implemented');
    }
}

export default StorageService;
