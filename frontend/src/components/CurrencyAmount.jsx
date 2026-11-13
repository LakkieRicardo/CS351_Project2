const CurrencyAmount = ({ value }) => (
  <span className="currency-amount">
    <img src={`${import.meta.env.BASE_URL}souls.png`} alt="Souls" className="souls-currency-icon" />
    {value}
  </span>
);

export default CurrencyAmount;
