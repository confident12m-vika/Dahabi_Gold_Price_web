import CurrencySelect from './CurrencySelect';

const GOLD_KARATS = [24, 22, 21, 18];
const SILVER_PURITIES = [999, 925, 800, 750];

export default function PriceCard({
  isGold, price, currency, onCurrencyChange, currencies,
  karat, onKaratChange, unitLabel,
}) {
  const options = isGold ? GOLD_KARATS : SILVER_PURITIES;

  return (
    <div className={`price-card ${isGold ? 'pc-gold' : 'pc-silver'}`}>
      <div className="pc-top"><span>{isGold ? '★' : '●'}</span></div>
      <div className="pc-price">{price !== null ? price.toFixed(4) : '—'}</div>
      <div className="pc-unit">{unitLabel}</div>
      <div className="pc-pills">
        <CurrencySelect value={currency} onChange={onCurrencyChange} currencies={currencies} compact />
        <select className="karat-pill" value={karat} onChange={(e) => onKaratChange(parseInt(e.target.value, 10))}>
          {options.map((k) => (
            <option key={k} value={k}>{isGold ? k : `\u2030${k}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
