import Location from './location.model.js';

class LocationService {
    async getAllLocations(params = {}) {
        const { page = 1, limit = 100, search, is_active } = params;
        const offset = (page - 1) * limit;

        const where = {};
        if (is_active !== undefined && is_active !== null && is_active !== '') {
            where.is_active = is_active === 'true' || is_active === true;
        }
        if (search) {
            const { Op } = await import('sequelize');
            where[Op.or] = [
                { city_name: { [Op.iLike]: `%${search}%` } },
                { state: { [Op.iLike]: `%${search}%` } },
                { pincode: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Location.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['city_name', 'ASC']]
        });

        return {
            locations: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }

    async getActiveLocations() {
        return await Location.findAll({
            where: { is_active: true },
            order: [['city_name', 'ASC']]
        });
    }

    async createLocation(data) {
        if (data.city_name) data.city_name = data.city_name.trim();
        if (data.state) data.state = data.state.trim();
        return await Location.create(data);
    }

    async updateLocation(id, data) {
        if (data.city_name) data.city_name = data.city_name.trim();
        if (data.state) data.state = data.state.trim();
        const location = await Location.findByPk(id);
        if (!location) {
            const error = new Error('Location not found');
            error.statusCode = 404;
            throw error;
        }
        return await location.update(data);
    }

    async deleteLocation(id) {
        const location = await Location.findByPk(id);
        if (!location) {
            const error = new Error('Location not found');
            error.statusCode = 404;
            throw error;
        }
        return await location.destroy();
    }
}

export default new LocationService();
