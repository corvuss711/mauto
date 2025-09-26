import 'dotenv/config';

async function testCloudinary() {
    try {
        console.log('Testing Cloudinary configuration...');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('API Key:', process.env.CLOUDINARY_API_KEY);
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

        // Test Cloudinary connection
        const cloudinaryModule = await import('cloudinary');
        const cloudinary = cloudinaryModule.v2;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Test a simple API call
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result);

    } catch (error) {
        console.error('❌ Cloudinary test failed:');
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        console.error('Full error:', error);
    }
}

testCloudinary();
