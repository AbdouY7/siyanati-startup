const generateOrderNumber = () => {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now()}-${suffix}`;
};

const calculateOrderTotals = (items, loyalty_points_used = 0) => {
  const subtotal_dzd = items.reduce(
    (total, item) => total + Number(item.price_dzd) * item.quantity,
    0,
  );
  const discount_dzd = loyalty_points_used;
  const total_dzd = subtotal_dzd - discount_dzd;
  const loyalty_points_earned = Math.floor(total_dzd / 100);

  return {
    subtotal_dzd,
    discount_dzd,
    total_dzd,
    loyalty_points_earned,
  };
};

module.exports = {
  generateOrderNumber,
  calculateOrderTotals,
};
