const fetch = require('node-fetch');

(async () => {
  try {
    // Mock login to get token (Demo uses a predefined token or we can just fetch one)
    // Actually, demo login route is POST /api/v1/auth/demo
    console.log("Logging in as Demo...");
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log("Got token. Booking package...");
    const payload = {
      packageId: "012c5ecb-3276-42e9-a746-67f70e22690f",
      travelDate: "2026-10-15",
      guestData: [
        { title: "Mr", firstName: "Test", lastName: "User", gender: "Male", nationality: "Indian", email: "test@example.com", mobile: "9876543210" }
      ]
    };

    const bookRes = await fetch('http://localhost:5000/api/v1/bookings/package', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const bookData = await bookRes.json();
    
    if (bookData.booking) {
      console.log("Booking successful! ID:", bookData.booking.id);
      
      console.log("Paying for booking...");
      const payRes = await fetch(`http://localhost:5000/api/v1/bookings/${bookData.booking.id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payData = await payRes.json();
      console.log("Payment status:", payData.booking.status);
    } else {
      console.log("Booking failed:", bookData);
    }
  } catch (err) {
    console.error(err);
  }
})();
