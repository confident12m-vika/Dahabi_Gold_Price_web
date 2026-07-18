import { useLang } from '../contexts/LangContext';

export default function MetalKaratPicker({ metal, setMetal, karat, setKarat }) {
  const { t } = useLang();
  return (
    <>
      <div className="tool-field">
        <label>{t('lbl_metal')}</label>
        <div className="segmented">
          <button className={metal === 'gold' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('gold')}>{t('metal_gold')}</button>
          <button className={metal === 'silver' ? 'seg-btn active' : 'seg-btn'} onClick={() => setMetal('silver')}>{t('metal_silver')}</button>
        </div>
      </div>
      {metal === 'gold' && (
        <div className="tool-field">
          <label>{t('lbl_karat')}</label>
          <select value={karat} onChange={(e) => setKarat(parseInt(e.target.value, 10))}>
            <option value={24}>24</option>
            <option value={22}>22</option>
            <option value={21}>21</option>
            <option value={18}>18</option>
          </select>
        </div>
      )}
    </>
  );
}
