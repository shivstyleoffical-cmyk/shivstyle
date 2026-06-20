import locationService from './location.service.js';

export const getAllLocations = async (req, res, next) => {
    try {
        const result = await locationService.getAllLocations(req.query);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const getActiveLocations = async (req, res, next) => {
    try {
        const locations = await locationService.getActiveLocations();
        return res.status(200).json({ success: true, locations });
    } catch (error) {
        next(error);
    }
};

export const createLocation = async (req, res, next) => {
    try {
        const location = await locationService.createLocation(req.body);
        return res.status(201).json({ success: true, location });
    } catch (error) {
        next(error);
    }
};

export const updateLocation = async (req, res, next) => {
    try {
        const location = await locationService.updateLocation(req.params.id, req.body);
        return res.status(200).json({ success: true, location });
    } catch (error) {
        next(error);
    }
};

export const deleteLocation = async (req, res, next) => {
    try {
        await locationService.deleteLocation(req.params.id);
        return res.status(200).json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        next(error);
    }
};
