// TODO: Initialize the Fingerprint agent as soon as possible
const fpPromise = import("https://fpjscdn.net/v3/jm6zdsSsM6d83g1fuDsS").then(
  (FingerprintJS) => FingerprintJS.load({ region: "us" })
);
const { createApp } = Vue;

createApp({
  data() {
    return {
      items: [
        {
          id: "coffee-tumbler",
          name: "Insulated Coffee Tumbler (16 oz)",
          quantity: 1,
          price: 19.99,
        },
        {
          id: "charging-pad",
          name: "Wireless Charging Pad",
          quantity: 2,
          price: 39.98,
        },
        {
          id: "desk-lamp",
          name: "LED Desk Lamp with USB Charging Port",
          quantity: 1,
          price: 59.97,
        },
      ],
      couponPercent: 0,
      couponApplied: false,
      coupon: "",
      couponError: "",
      orderError: "",
      orderWarning: "",
    };
  },
  computed: {
    subtotal() {
      return this.items.reduce((acc, item) => {
        return acc + item.price * item.quantity;
      }, 0);
    },
    savings() {
      return this.couponApplied ? this.subtotal * this.couponPercent : 0;
    },
    couponSubtotal() {
      return this.subtotal - this.savings;
    },
    tax() {
      return this.couponSubtotal * 0.065;
    },
    total() {
      return this.couponSubtotal + this.tax;
    },
  },
  methods: {
    async applyCoupon() {
      this.coupon = this.coupon.toUpperCase();

      // TODO: Request identification data when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
      const { sealedResult } = result;

      // TODO: Include the requestId and/or sealedResult with the order details
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupon: this.coupon, sealedResult }),
      });

      const data = await response.json();

      if (data.success) {
        this.couponApplied = true;
        this.couponError = "";
        this.couponPercent = data.percent;
      }
      if (data.error) {
        this.couponApplied = false;
        this.couponError = data.error;
      }
    },
    removeCoupon() {
      this.couponApplied = false;
      this.coupon = "";
      this.couponError = "";
    },
    async submitOrder() {
      // TODO: Request identification data when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
      const { sealedResult } = result;

      // TODO: Include the requestId and/or sealedResult with the order details
      const response = await fetch("/api/process-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: this.items,
          coupon: this.coupon,
          total: Math.round(this.total * 100) / 100,
          sealedResult,
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = "/confirmation";
      }
      if (data.error) {
        this.orderError = data.error;
      }
      if (data.warning) {
        this.orderWarning = data.warning;
      }
    },
  },
}).mount("#app");
