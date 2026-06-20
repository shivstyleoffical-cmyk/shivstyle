/**
 * Database Associations Configuration
 * This file sets up all Sequelize model relationships.
 * Models are now organized in their respective modules for better scalability.
 */

// User Module Models
import role from "../modules/user/role.model.js";
import user from "../modules/user/user.model.js";
import userRole from "../modules/user/user-role.model.js";

// Category Module Models
import Category from "../modules/category/category.model.js";

// Product Module Models
import Product from "../modules/product/product.model.js";
import ProductVariant from "../modules/product/product-variant.model.js";
import ProductImage from "../modules/product/product-image.model.js";

// Order Module Models
import Order from "../modules/order/order.model.js";
import OrderItem from "../modules/order/order-item.model.js";
import OrderShippingAddress from "../modules/order/order-shipping-address.model.js";

// User Module Models (Address moved here)
import Address from "../modules/user/address.model.js";

// Wishlist Module Models
import Wishlist from "../modules/wishlist/wishlist.model.js";

// Shared Models
import Offer from "../modules/offer/offer.model.js";
import Notification from "../modules/notification/notification.model.js";
import Location from "../modules/location/location.model.js";

// ============================================
// USER ASSOCIATIONS
// ============================================

user.belongsToMany(role, {
    through: userRole,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles',
});

role.belongsToMany(user, {
    through: userRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users',
});

// ============================================
// CATEGORY ASSOCIATIONS
// ============================================

// Self-referencing for parent-child
Category.hasMany(Category, {
    foreignKey: 'parent_cat_id',
    as: 'children'
});

Category.belongsTo(Category, {
    foreignKey: 'parent_cat_id',
    as: 'parent'
});

// Category has many Products
Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products'
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// ============================================
// PRODUCT ASSOCIATIONS
// ============================================

// Product has many variants
Product.hasMany(ProductVariant, {
    foreignKey: 'product_id',
    as: 'variants'
});

ProductVariant.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// Product has many images
Product.hasMany(ProductImage, {
    foreignKey: 'product_id',
    as: 'images'
});

ProductImage.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

// ============================================
// ORDER ASSOCIATIONS
// ============================================

user.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders'
});

Order.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user'
});

Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'orderItems'
});

OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

OrderItem.belongsTo(ProductVariant, {
    foreignKey: 'product_variant_id',
    as: 'variant'
});

Order.hasOne(OrderShippingAddress, {
    foreignKey: 'order_id',
    as: 'shippingAddress'
});

OrderShippingAddress.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order'
});

OrderShippingAddress.belongsTo(Address, {
    foreignKey: 'shipping_address_id',
    as: 'savedAddress'
});

// User addresses
user.hasMany(Address, {
    foreignKey: 'user_id',
    as: 'addresses'
});

Address.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user'
});

// ============================================
// WISHLIST ASSOCIATIONS
// ============================================

user.hasMany(Wishlist, {
    foreignKey: 'user_id',
    as: 'wishlistItems'
});

Wishlist.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user'
});

Wishlist.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

Wishlist.belongsTo(ProductVariant, {
    foreignKey: 'product_variant_id',
    as: 'variant'
});

// ============================================
// OFFER ASSOCIATIONS (Shared Model)
// ============================================

Offer.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

Offer.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// ============================================
// NOTIFICATION ASSOCIATIONS
// ============================================

Notification.belongsTo(user, {
    foreignKey: 'user_id',
    as: 'user'
});

user.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications'
});

export {
    user,
    role,
    userRole,
    Category,
    Product,
    ProductVariant,
    ProductImage,
    Order,
    OrderItem,
    OrderShippingAddress,
    Address,
    Wishlist,
    Offer,
    Notification,
    Location
};