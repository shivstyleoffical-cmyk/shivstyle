import userService from './src/modules/user/user.service.js';
import { connectDB } from './src/database/connection.js';

async function testAddAddress() {
    try {
        await connectDB();
        const userId = 'a274a64a-6a09-40a7-9d32-ea0dc4cc6719';
        const data = {
            full_name: 'Test Project',
            phone: '+919876543210',
            address_line1: '1st Floor',
            address_line2: ', Relli Road',
            city: 'Kalimpong',
            state: 'West Bengal',
            postal_code: '734301',
            country: 'India',
            is_default: true
        };
        const result = await userService.addAddress(userId, data);
        console.log('SUCCESS:', result.toJSON());
    } catch (err) {
        console.error('FAILURE:', err);
    } finally {
        process.exit();
    }
}

testAddAddress();
