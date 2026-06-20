import { storageService } from '../../integrations/index.js';

export const uploadToCloudinary = async (fileBuffer, folder = 'ecommerce', publicId = null) => {
    return await storageService.upload(fileBuffer, folder, publicId);
};

export const deleteFromCloudinary = async (publicId) => {
    return await storageService.delete(publicId);
};

export const extractPublicIdFromUrl = (url) => {
    return storageService.extractPublicIdFromUrl(url);
};
