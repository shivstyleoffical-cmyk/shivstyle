import User from './user.model.js';
// import UserProfile from './user-profile.model.js';
import role from './role.model.js';
import { enumRole } from '../../shared/constants/roles.js';

export const adminMiddleware = async (req, res, next) => {
    try {
        // First, ensure user is authenticated
        if (!req.user || !req.user.userId) {
            const error = new Error('Authentication required');
            error.statusCode = 401;
            return next(error);
        }

        // Get user with roles
        const user = await User.findOne({
            where: { id: req.user.userId },
            include: [
                {
                    model: role,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['role_name']
                }
            ]
        });

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        // Check if user has admin role using enum
        const userRoles = user.roles.map(role => role.role_name);
        const isAdmin = userRoles.includes('admin');

        if (!isAdmin) {
            const error = new Error('Admin access required');
            error.statusCode = 403;
            error.message = 'You do not have permission to perform this action. Admin access required.';
            return next(error);
        }

        // Add user info to request for use in controllers
        req.user.roles = userRoles;
        req.user.isAdmin = isAdmin;

        next();
    } catch (error) {
        error.statusCode = 500;
        error.message = 'Error checking admin permissions';
        return next(error);
    }
};

// Middleware for specific admin roles
export const requireRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            // First, ensure user is authenticated
            if (!req.user || !req.user.userId) {
                const error = new Error('Authentication required');
                error.statusCode = 401;
                return next(error);
            }

            // Get user with roles
            const user = await User.findOne({
                where: { id: req.user.userId },
                include: [
                    {
                        model: role,
                        as: 'roles',
                        through: { attributes: [] },
                        attributes: ['role_name']
                    }
                ]
            });

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                return next(error);
            }

            // Check if user has any of the required roles using enum validation
            const userRoles = user.roles.map(role => role.role_name);
            const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));

            // Validate that required roles are valid enum values
            const invalidRoles = requiredRoles.filter(role => !enumRole.includes(role));
            if (invalidRoles.length > 0) {
                const error = new Error('Invalid role specified');
                error.statusCode = 400;
                error.message = `Invalid roles: ${invalidRoles.join(', ')}. Valid roles: ${enumRole.join(', ')}`;
                return next(error);
            }

            if (!hasRequiredRole) {
                const error = new Error('Insufficient permissions');
                error.statusCode = 403;
                error.message = `Access denied. Required roles: ${requiredRoles.join(', ')}`;
                return next(error);
            }

            // Add user info to request
            req.user.roles = userRoles;
            req.user.hasRequiredRole = hasRequiredRole;

            next();
        } catch (error) {
            error.statusCode = 500;
            error.message = 'Error checking role permissions';
            return next(error);
        }
    };
};

// Specific role middlewares using enum values
export const adminOrSuperAdminMiddleware = requireRole(['admin']);
export const customerMiddleware = requireRole(['customer', 'admin']);

// Helper function to get admin roles from enum
export const getAdminRoles = () => {
    return ['admin'];
};

// Helper function to validate role
export const isValidRole = (role) => {
    return enumRole.includes(role);
};
