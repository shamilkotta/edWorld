const Razorpay = require("razorpay");

const razInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateRazorpayOrder = (amountInInr) => {
  const amount = amountInInr * 100;
  const options = {
    amount,
    currency: "INR",
  };
  return new Promise((resolve) => {
    razInstance.orders.create(options, (err, order) => {
      if (err)
        resolve({
          success: false,
          message: "Something went wrong, try again",
        });
      else
        resolve({
          success: true,
          order,
        });
    });
  });
};

module.exports = generateRazorpayOrder;
