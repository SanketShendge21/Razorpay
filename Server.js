const jwt = require('jsonwebtoken')
const connectToMongo = require('../middleware/connectDB');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Products');
const pincodes = require('../data/pincodes.json')
const Razorpay = require("razorpay");
const crypto = require('crypto');

connectToMongo();
// Pretransaction function

//TODO : Complete both functions
const preTransaction = async (req, res) => {
    try {

        if (req.method === 'POST') {


            //     let product, sum = 0;
            //     let testCart = req.body.cart;
            //     if (req.body.subTotal <= 0) {
            //         res.status(400).json({ success: false, "error": "Your testCart is empty.Please build your testCart and try again", testCartClear: false })
            //         return;
            //     }

            //     // Check if the pincode is serviceable
            //     if (!Object.keys(pincodes).includes(req.body.pincode)) {
            //         res.status(400).json({ success: false, "error": "This pincode is not serviceable", testCartClear: false })
            //         return;
            //     }

            //     // Calculate the total amount and match it with the total amount from the testCart
            //     for (let item in testCart) {
            //         sum += testCart[item].price * testCart[item].quantity

            //         // Check if testCart items are out of stock
            //         product = await Product.findOne({ slug: item.slug })
            //         if (product.availableQty < testCart[item].quantity) {
            //             res.status(400).json({ success: false, "error": "Some items in your testCart went out of stock. Please try again", testCartClear: true })
            //             return;
            //         }
            //         if (product.price !== testCart[item].price) {
            //             res.status(400).json({ success: false, "error": "The price of some items in your testCart is incorrect. Please try again", testCartClear: true })
            //             return;
            //         }
            //     }

            //     // Check if the details are valid
            //     if (sum !== req.body.subTotal) {
            //         res.status(400).json({ success: false, "error": "The price of some items in your testCart is incorrect. Please try again", testCartClear: true })
            //         return;
            //     }

            //     // Validate the phone and pincode
            //     if (req.body.phone.length !== 10 || !Number.isInteger(Number(req.body.phone))) {
            //         res.status(400).json({ success: false, "error": "Please enter a valid phone number", testCartClear: false })
            //         return;
            //     }

            //     if (req.body.pincode.length !== 6 || !Number.isInteger(Number(req.body.pincode))) {
            //         res.status(400).json({ success: false, "error": "Please enter a valid pincode", testCartClear: false })
            //         return;
            //     }


            // Razor Pay Integration

            const razorpay = new Razorpay({
                key_id: process.env.RAZOR_PAY_KEY_ID,
                key_secret: process.env.RAZOR_PAY_TEST_KEY,
            });
            const options = req.body;
            console.log("This is options"+JSON.stringify(options)  + "\n" );
            const razorOrder = await razorpay.orders.create(options)

            if (!razorOrder) {
                return res.status(500).json({ success: false, message: "Internal Server Error" });
            }

            //Inititate an order corresponding to the orderID

            // Insert an entry in the orders table with status as pending

            // const { subTotal, cart, email, address, oid, state, city, pincode, phone, name } = req.body;

            // let order = new Order({
            //     email: email,
            //     name: name,
            //     orderId: oid,
            //     address: address,
            //     phone: phone,
            //     city: city,
            //     state: state,
            //     pincode: pincode,
            //     amount: subTotal,
            //     products: cart,
            // });

            // await order.save();

            return res.status(200).json({ success: true, message: 'Order created', order: razorOrder });
        }
        else {
            return res.status(400).json({ success: false, message: "This method is not allowed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// Post transaction function

const postTransaction = async (req, res) => {
    try {
        if (req.method === 'POST') {
            console.log("This is body" + req.body + "\n");
            const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
            const razorpay = new Razorpay({
                key_id: process.env.RAZOR_PAY_KEY_ID,
                key_secret: process.env.RAZOR_PAY_TEST_KEY,
            });
            let instance = await razorpay.payments.fetch(razorpay_payment_id)
            console.log("This is instance: " + JSON.stringify(instance) + "\n");
            const sha = crypto.createHmac("sha256", process.env.RAZOR_PAY_TEST_KEY);
            sha.update(`${orderId}|${razorpay_payment_id}`);
            const digest = sha.digest("hex");
            console.log("This is digest" +digest  + "\n");
            console.log("This is signature" +razorpay_signature  + "\n" );
            
            if (digest !== razorpay_signature) {
                return res.status(400).json({ message: "Transaction is not legit!" });
            }

            return res.status(200).json({
                success: true,
                msg: "Order Placed Successfully",
                orderId: orderId,
                paymentId: razorpay_payment_id,
            });

        }
        else {
            return res.status(400).json({ success: false, message: "This method is not allowed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        console.log(error.message);
    }

};

module.exports = { preTransaction, postTransaction };
