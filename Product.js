// import TshirtImg from "./tshirt.svg";

function Product() {
  const amount = 100;
  const currency = "INR";
  const receiptId = "noms";

  const paymentHandler = async (e) => {
    const response = await fetch("http://localhost:5000/api/payments/pretransaction", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency,
        receipt: receiptId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const order = await response.json();
    console.log(order);

    var options = {
      key: "rzp_test_7u3EJtosigvghN", // Enter the Key ID generated from the Dashboard
      amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency,
      name: "Noms Corp", //your business name
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: async function (response) {
        console.log("This is response" + JSON.stringify(response));
        console.log(response);
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
        const data = {
          orderId: order.id,
          ...response
        };
        console.log("This is data"+JSON.stringify(data))
        const validateRes = await fetch(
          "http://localhost:5000/api/payments/posttransaction",
          {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const jsonRes = await validateRes.json();
        console.log(jsonRes);
      },
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
        name: "Sanket Shendge", //your customer's name
        email: "sanketshendge@example.com",
        contact: "123456798", //Provide the customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

  var rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response) {
      alert(response.error.code);
      alert(response.error.description);
      alert(response.error.source);
      alert(response.error.step);
      alert(response.error.reason);
      alert(response.error.metadata.order_id);
      alert(response.error.metadata.payment_id);
    });
    rzp1.open();
    e.preventDefault();
  };

  return (
    <div className="product">
      <h2>Tshirt</h2>
      <p>Solid blue cotton Tshirt</p>
      <img src="https://m.media-amazon.com/images/I/51PmZHmFChL._SX679_.jpg" alt="Error"/>
      <br />
      <button onClick={paymentHandler}>Pay</button>
    </div>
  );
}

export default Product;

