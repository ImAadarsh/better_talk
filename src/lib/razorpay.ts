import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_KEY_SECRET) {
    throw new Error('RAZORPAY_API_KEY and RAZORPAY_API_KEY_SECRET must be defined');
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_KEY_SECRET,
});
